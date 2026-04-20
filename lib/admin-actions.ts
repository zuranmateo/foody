'use server'

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeClient } from "@/sanity/lib/write-client";
import {
    ALL_INGREDIENTS_QUERY,
    DISH_REFERENCED_IN_ORDERS_QUERY,
    DISH_SLUG_EXISTS_QUERY,
} from "@/sanity/lib/query";
import { normalizeText } from "@/lib/validation";
import * as XLSX from "xlsx";

const allowedIngredientUnits = new Set(["kosov", "mg", "g", "kg", "ml", "l"]);

export type ImportIngredientsState = {
    status: "idle" | "success" | "error";
    message: string;
    summary?: {
        created: number;
        updated: number;
        rowsProcessed: number;
    };
};

const initialImportIngredientsState: ImportIngredientsState = {
    status: "idle",
    message: "",
};

type IngredientRow = {
    name?: string;
    quantity?: string | number;
    unit?: string;
    inStock?: string | boolean;
};

type ExistingIngredient = {
    _id: string;
    name: string;
    quantity?: number;
    unit?: string;
    inStock?: boolean;
};

function normalizeIngredientName(value: string) {
    return value
        .normalize("NFKC")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function parseIngredientNumber(value: string | number | undefined, rowNumber: number) {
    const raw = String(value ?? "").trim().replace(",", ".");

    if (!raw) {
        throw new Error(`Row ${rowNumber}: quantity is required.`);
    }

    const parsed = Number(raw);

    if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`Row ${rowNumber}: quantity must be a non-negative number.`);
    }

    return Number(parsed.toFixed(2));
}

function parseIngredientUnit(value: string | undefined, rowNumber: number) {
    const unit = String(value ?? "").trim().toLowerCase();

    if (!unit) {
        throw new Error(`Row ${rowNumber}: unit is required.`);
    }

    if (!allowedIngredientUnits.has(unit)) {
        throw new Error(
            `Row ${rowNumber}: unit "${unit}" is invalid. Allowed units: ${Array.from(allowedIngredientUnits).join(", ")}.`,
        );
    }

    return unit;
}

function parseOptionalStockValue(value: string | boolean | undefined, rowNumber: number) {
    if (value === undefined || value === null || String(value).trim() === "") {
        return {
            hasValue: false,
            value: false,
        };
    }

    if (typeof value === "boolean") {
        return {
            hasValue: true,
            value,
        };
    }

    const normalized = String(value).trim().toLowerCase();

    if (["true", "yes", "1", "in stock", "instock"].includes(normalized)) {
        return {
            hasValue: true,
            value: true,
        };
    }

    if (["false", "no", "0", "out of stock", "outofstock"].includes(normalized)) {
        return {
            hasValue: true,
            value: false,
        };
    }

    throw new Error(
        `Row ${rowNumber}: inStock must be true/false, yes/no, 1/0, in stock/out of stock.`,
    );
}

function createIngredientDocumentId(name: string) {
    const slug = name
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

    return `ingredient-${slug || crypto.randomUUID()}-${crypto.randomUUID().slice(0, 8)}`;
}

export async function ImportIngredientsFromExcel(
    _previousState: ImportIngredientsState = initialImportIngredientsState,
    formData: FormData,
): Promise<ImportIngredientsState> {
    try {
        void _previousState;
        await requireAdmin();

        const confirmation = String(formData.get("confirmImport") ?? "");

        if (confirmation !== "on") {
            return {
                status: "error",
                message: "Confirm the import before uploading ingredients.",
            };
        }

        const file = formData.get("excelFile");

        if (!(file instanceof File)) {
            return {
                status: "error",
                message: "Choose an Excel file before importing.",
            };
        }

        if (!file.name.toLowerCase().endsWith(".xlsx") && !file.name.toLowerCase().endsWith(".xls")) {
            return {
                status: "error",
                message: "Only .xlsx or .xls files are supported.",
            };
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const workbook = XLSX.read(buffer, { type: "buffer" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
            return {
                status: "error",
                message: "The Excel file does not contain any sheets.",
            };
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json<IngredientRow>(worksheet, {
            defval: "",
        });
        const headerKeys = Object.keys(rows[0] ?? {}).map((key) => key.trim());
        const requiredHeaders = ["name", "quantity", "unit"];

        if (!rows.length) {
            return {
                status: "error",
                message: "The Excel sheet is empty.",
            };
        }

        const missingHeaders = requiredHeaders.filter((header) => !headerKeys.includes(header));

        if (missingHeaders.length > 0) {
            return {
                status: "error",
                message: `Missing required column(s): ${missingHeaders.join(", ")}. Expected headers: name, quantity, unit, inStock.`,
            };
        }

        const aggregatedRows = new Map<
            string,
            {
                name: string;
                quantity: number;
                unit: string;
                hasExplicitStock: boolean;
                explicitStockValue: boolean;
            }
        >();

        rows.forEach((row, index) => {
            const rowNumber = index + 2;
            const name = String(row.name ?? "").trim();

            if (!name) {
                throw new Error(`Row ${rowNumber}: name is required.`);
            }

            const quantity = parseIngredientNumber(row.quantity, rowNumber);
            const unit = parseIngredientUnit(row.unit, rowNumber);
            const stock = parseOptionalStockValue(row.inStock, rowNumber);
            const key = normalizeIngredientName(name);
            const existing = aggregatedRows.get(key);

            if (existing) {
                if (existing.unit !== unit) {
                    throw new Error(
                        `Row ${rowNumber}: ingredient "${name}" is repeated with a different unit.`,
                    );
                }

                if (
                    stock.hasValue &&
                    existing.hasExplicitStock &&
                    existing.explicitStockValue !== stock.value
                ) {
                    throw new Error(
                        `Row ${rowNumber}: ingredient "${name}" has conflicting inStock values.`,
                    );
                }

                existing.quantity = Number((existing.quantity + quantity).toFixed(2));

                if (stock.hasValue) {
                    existing.hasExplicitStock = true;
                    existing.explicitStockValue = stock.value;
                }

                return;
            }

            aggregatedRows.set(key, {
                name,
                quantity,
                unit,
                hasExplicitStock: stock.hasValue,
                explicitStockValue: stock.value,
            });
        });

        const existingIngredients = await writeClient.fetch<ExistingIngredient[]>(ALL_INGREDIENTS_QUERY);
        const existingIngredientMap = new Map<string, ExistingIngredient>();

        for (const ingredient of existingIngredients) {
            const key = normalizeIngredientName(ingredient.name);
            const duplicate = existingIngredientMap.get(key);

            if (duplicate) {
                return {
                    status: "error",
                    message: `Database already contains duplicate ingredients named "${ingredient.name}". Clean those up before importing.`,
                };
            }

            existingIngredientMap.set(key, ingredient);
        }

        const transaction = writeClient.transaction();
        let created = 0;
        let updated = 0;

        for (const [key, ingredient] of aggregatedRows.entries()) {
            const existing = existingIngredientMap.get(key);

            if (existing) {
                const existingUnit = String(existing.unit ?? "").trim().toLowerCase();

                if (existingUnit && existingUnit !== ingredient.unit) {
                    return {
                        status: "error",
                        message: `Ingredient "${ingredient.name}" already exists with unit "${existing.unit}", but the Excel file uses "${ingredient.unit}".`,
                    };
                }

                const nextQuantity = Number((Number(existing.quantity ?? 0) + ingredient.quantity).toFixed(2));
                const nextInStock = ingredient.hasExplicitStock
                    ? ingredient.explicitStockValue
                    : nextQuantity > 0;

                transaction.patch(existing._id, {
                    set: {
                        quantity: nextQuantity,
                        unit: ingredient.unit,
                        inStock: nextInStock,
                    },
                });
                updated += 1;
                continue;
            }

            transaction.create({
                _id: createIngredientDocumentId(ingredient.name),
                _type: "ingredients",
                name: ingredient.name,
                quantity: ingredient.quantity,
                unit: ingredient.unit,
                inStock: ingredient.hasExplicitStock ? ingredient.explicitStockValue : ingredient.quantity > 0,
            });
            created += 1;
        }

        await transaction.commit();

        revalidatePath("/control/ingredients");
        revalidatePath("/control/dashboard");

        return {
            status: "success",
            message: "Excel import completed successfully.",
            summary: {
                created,
                updated,
                rowsProcessed: rows.length,
            },
        };
    } catch (error) {
        return {
            status: "error",
            message: error instanceof Error ? error.message : "The Excel import failed.",
        };
    }
}

export async function requireAdmin() {
    const session = await auth();

    if (!session?.user?._id) {
        redirect("/login");
    }

    if (session.user.role !== "admin") {
        redirect("/");
    }

    return session;
}

export async function UpdateIngredient(formData: FormData) {
    await requireAdmin();

    const ingredientId = String(formData.get("ingredientId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const quantityValue = String(formData.get("quantity") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const inStockValue = String(formData.get("inStock") ?? "false");

    if (!ingredientId || !name) {
        throw new Error("Ingredient name is required.");
    }

    const quantity = quantityValue === "" ? 0 : Number(quantityValue);

    if (Number.isNaN(quantity) || quantity < 0) {
        throw new Error("Quantity must be a valid positive number.");
    }

    await writeClient
        .patch(ingredientId)
        .set({
            name,
            quantity,
            unit: unit || undefined,
            inStock: inStockValue === "true",
        })
        .commit();

    revalidatePath("/control/ingredients");
    revalidatePath("/control/dashboard");
}

export async function UpdateOrderStatus(formData: FormData) {
    await requireAdmin();

    const orderId = String(formData.get("orderId") ?? "");
    const status = String(formData.get("status") ?? "").trim();
    const userId = String(formData.get("userId") ?? "").trim();

    if (!orderId) {
        throw new Error("Order id is required.");
    }

    if (!["pending", "preparing", "delivered"].includes(status)) {
        throw new Error("Invalid order status.");
    }

    await writeClient
        .patch(orderId)
        .set({
            status,
        })
        .commit();

    revalidatePath("/control/orders");
    revalidatePath("/control/dashboard");

    if (userId) {
        revalidatePath(`/user/${userId}`);
    }
}

function createBaseSlug(name: string) {
    return name
        .normalize("NFKD")
        .replace(/[^\w\s-]/g, "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function createUniqueDishSlug(name: string) {
    const baseSlug = createBaseSlug(name) || `dish-${Date.now()}`;
    let candidate = baseSlug;
    let suffix = 1;

    while (await writeClient.fetch<boolean>(DISH_SLUG_EXISTS_QUERY, { slug: candidate })) {
        candidate = `${baseSlug}-${suffix}`;
        suffix += 1;
    }

    return candidate;
}

async function createUniqueDishSlugForUpdate(name: string, currentSlug?: string) {
    const baseSlug = createBaseSlug(name) || `dish-${Date.now()}`;

    if (!currentSlug || currentSlug !== baseSlug) {
        return createUniqueDishSlug(name);
    }

    return currentSlug;
}

function buildDishIngredients(formData: FormData) {
    return formData
        .getAll("ingredientId")
        .map((value) => String(value))
        .filter(Boolean)
        .map((ingredientId, index) => {
            const quantityValue = normalizeText(formData.get(`ingredientQuantity:${ingredientId}`), 20);
            const quantity = Number(quantityValue);

            if (!quantityValue || Number.isNaN(quantity) || quantity <= 0) {
                return null;
            }

            return {
                _key: `${ingredientId}-${Date.now()}-${index}`,
                ingredient: {
                    _type: "reference",
                    _ref: ingredientId,
                },
                quantity,
            };
        })
        .filter(Boolean);
}

export async function CreateDish(formData: FormData) {
    await requireAdmin();

    const name = normalizeText(formData.get("name"), 120);
    const description = normalizeText(formData.get("description"), 1000);
    const category = normalizeText(formData.get("category"), 40);
    const priceValue = normalizeText(formData.get("price"), 20);
    const preparationTimeValue = normalizeText(formData.get("preparationTime"), 20);
    const isPopular = String(formData.get("isPopular") ?? "") === "on";
    const isAvailable = String(formData.get("isAvailable") ?? "") === "on";
    if (!name || !category || !priceValue) {
        throw new Error("Name, category, and price are required.");
    }

    const price = Number(priceValue);
    const preparationTime = preparationTimeValue ? Number(preparationTimeValue) : undefined;

    if (Number.isNaN(price) || price < 0) {
        throw new Error("Price must be a valid non-negative number.");
    }

    if (
        preparationTimeValue &&
        (Number.isNaN(preparationTime) || (preparationTime ?? 0) < 0)
    ) {
        throw new Error("Preparation time must be a valid non-negative number.");
    }

    const ingredients = buildDishIngredients(formData);
    const slug = await createUniqueDishSlug(name);

    await writeClient.create({
        _type: "dishes",
        name,
        slug: {
            _type: "slug",
            current: slug,
        },
        description: description || undefined,
        price,
        category,
        preparationTime,
        isPopular,
        isAvailable,
        ingredients,
    });

    revalidatePath("/menu");
    revalidatePath("/control/dishes");
    revalidatePath("/control/dashboard");
}

export async function UpdateDish(formData: FormData) {
    await requireAdmin();

    const dishId = normalizeText(formData.get("dishId"), 80);
    const currentSlug = normalizeText(formData.get("currentSlug"), 120);
    const name = normalizeText(formData.get("name"), 120);
    const description = normalizeText(formData.get("description"), 1000);
    const category = normalizeText(formData.get("category"), 40);
    const priceValue = normalizeText(formData.get("price"), 20);
    const preparationTimeValue = normalizeText(formData.get("preparationTime"), 20);
    const isPopular = String(formData.get("isPopular") ?? "") === "on";
    const isAvailable = String(formData.get("isAvailable") ?? "") === "on";

    if (!dishId || !name || !category || !priceValue) {
        throw new Error("Dish id, name, category, and price are required.");
    }

    const price = Number(priceValue);
    const preparationTime = preparationTimeValue ? Number(preparationTimeValue) : undefined;

    if (Number.isNaN(price) || price < 0) {
        throw new Error("Price must be a valid non-negative number.");
    }

    if (
        preparationTimeValue &&
        (Number.isNaN(preparationTime) || (preparationTime ?? 0) < 0)
    ) {
        throw new Error("Preparation time must be a valid non-negative number.");
    }

    const slug = await createUniqueDishSlugForUpdate(name, currentSlug || undefined);
    const ingredients = buildDishIngredients(formData);

    await writeClient
        .patch(dishId)
        .set({
            name,
            slug: {
                _type: "slug",
                current: slug,
            },
            description: description || undefined,
            category,
            price,
            preparationTime,
            isPopular,
            isAvailable,
            ingredients,
        })
        .commit();

    revalidatePath("/menu");
    revalidatePath("/control/dishes");
    revalidatePath("/control/dashboard");
}

export async function DeleteDish(formData: FormData) {
    await requireAdmin();

    const dishId = normalizeText(formData.get("dishId"), 80);

    if (!dishId) {
        throw new Error("Dish id is required.");
    }

    const existingOrderReferences = await writeClient.fetch<number>(DISH_REFERENCED_IN_ORDERS_QUERY, {
        dishId,
    });

    if (existingOrderReferences > 0) {
        throw new Error("This dish is used in past orders, so it cannot be deleted.");
    }

    await writeClient.delete(dishId);

    revalidatePath("/menu");
    revalidatePath("/control/dishes");
    revalidatePath("/control/dashboard");
}

export async function DeleteIngredient(formData: FormData) {
    await requireAdmin();

    const ingredientId = String(formData.get("ingredientId") ?? "");

    if (!ingredientId) {
        throw new Error("Ingredient id is required.");
    }

    await writeClient.delete(ingredientId);

    revalidatePath("/control/ingredients");
    revalidatePath("/control/dashboard");
}

export async function ToggleDishAvailability(formData: FormData) {
    await requireAdmin();

    const dishId = normalizeText(formData.get("dishId"), 80);
    const nextValue = String(formData.get("isAvailable") ?? "") === "true";

    if (!dishId) {
        throw new Error("Dish id is required.");
    }

    await writeClient.patch(dishId).set({ isAvailable: nextValue }).commit();

    revalidatePath("/menu");
    revalidatePath("/control/dishes");
}
