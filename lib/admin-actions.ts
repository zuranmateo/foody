'use server'

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { writeClient } from "@/sanity/lib/write-client";
import { DISH_REFERENCED_IN_ORDERS_QUERY, DISH_SLUG_EXISTS_QUERY } from "@/sanity/lib/query";
import { normalizeText } from "@/lib/validation";

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
