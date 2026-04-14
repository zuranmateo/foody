import { UpdateIngredient } from "@/lib/admin-actions";
import { ALL_INGREDIENTS_QUERY } from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type Ingredient = {
    _id: string;
    name: string;
    quantity?: number;
    unit?: string;
    inStock?: boolean;
};

const units = ["kosov", "mg", "g", "kg", "ml" ,"l"];

export default async function IngredientsPage() {
    const ingredients = await writeClient.fetch<Ingredient[]>(ALL_INGREDIENTS_QUERY);

    return (
        <div className="space-y-6">
            <section>
                <h2 className="text-xl font-semibold">Ingredients</h2>
                <p className="text-sm text-muted-foreground">
                    Review stock levels and edit each ingredient directly from this page.
                </p>
            </section>

            <div className="space-y-4">
                {ingredients.length ? (
                    ingredients.map((ingredient) => (
                        <form
                            key={ingredient._id}
                            action={UpdateIngredient}
                            className="grid gap-4 rounded-3xl border p-4 lg:grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_auto]"
                        >
                            <input type="hidden" name="ingredientId" value={ingredient._id} />

                            <label className="space-y-2 text-sm">
                                <span className="text-muted-foreground">Name</span>
                                <input
                                    name="name"
                                    defaultValue={ingredient.name}
                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                    required
                                />
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="text-muted-foreground">Quantity</span>
                                <input
                                    name="quantity"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    defaultValue={ingredient.quantity ?? 0}
                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                />
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="text-muted-foreground">Unit</span>
                                <select
                                    name="unit"
                                    defaultValue={ingredient.unit ?? "g"}
                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                >
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>
                                            {unit}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="space-y-2 text-sm">
                                <span className="text-muted-foreground">Stock</span>
                                <select
                                    name="inStock"
                                    defaultValue={ingredient.inStock ? "true" : "false"}
                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                >
                                    <option value="true">In stock</option>
                                    <option value="false">Out of stock</option>
                                </select>
                            </label>

                            <div className="flex items-end">
                                <button
                                    type="submit"
                                    className="w-full rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground lg:w-auto"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    ))
                ) : (
                    <p className="text-muted-foreground">No ingredients were found.</p>
                )}
            </div>
        </div>
    );
}
