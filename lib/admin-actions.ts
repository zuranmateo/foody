'use server'

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { writeClient } from "@/sanity/lib/write-client";

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
}
