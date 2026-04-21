import AdminPagination from "@/components/admin/AdminPagination";
import MostOrderedDishDisplay from "@/components/graphs/MostOrderedDishDisplay";
import { ADMIN_PAGE_SIZE, getPagination, getTotalPages } from "@/lib/admin-pagination";
import { CreateDish, DeleteDish, UpdateDish } from "@/lib/admin-actions";
import { buildAdminAnalytics, type AnalyticsIngredient, type AnalyticsOrder } from "@/lib/admin-analytics";
import {
    ADMIN_ANALYTICS_ORDERS_QUERY,
    ADMIN_DISH_FORM_INGREDIENTS_QUERY,
    ALL_INGREDIENTS_QUERY,
    DISHES_COUNT_QUERY,
    PAGINATED_DISHES_QUERY,
} from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type DishesPageProps = {
    searchParams: Promise<{
        page?: string;
    }>;
};

type DishIngredient = {
    quantity?: number;
    ingredient?: {
        _id: string;
        name?: string;
        unit?: string;
    };
};

type AdminDish = {
    _id: string;
    name: string;
    slug?: string;
    description?: string;
    price?: number;
    category?: string;
    preparationTime?: number;
    isPopular?: boolean;
    isAvailable?: boolean;
    ingredients?: DishIngredient[];
};

type IngredientOption = {
    _id: string;
    name: string;
    unit?: string;
};

const categories = [
    { label: "Pizza", value: "pica" },
    { label: "Burger", value: "burger" },
    { label: "Pasta", value: "testenine" },
    { label: "Grill", value: "žar" },
    { label: "Fish", value: "ribe" },
    { label: "Seafood", value: "morska" },
    { label: "Drink", value: "drink" },
];

export default async function DishesPage({ searchParams }: DishesPageProps) {
    const { page: pageParam } = await searchParams;
    const pagination = getPagination(pageParam, ADMIN_PAGE_SIZE);
    const [totalDishes, ingredients, analyticsOrders, allIngredients] = await Promise.all([
        writeClient.fetch<number>(DISHES_COUNT_QUERY),
        writeClient.fetch<IngredientOption[]>(ADMIN_DISH_FORM_INGREDIENTS_QUERY),
        writeClient.fetch<AnalyticsOrder[]>(ADMIN_ANALYTICS_ORDERS_QUERY),
        writeClient.fetch<AnalyticsIngredient[]>(ALL_INGREDIENTS_QUERY),
    ]);
    const totalPages = getTotalPages(totalDishes, ADMIN_PAGE_SIZE);
    const currentPage = Math.min(pagination.page, totalPages);
    const dishes = await writeClient.fetch<AdminDish[]>(PAGINATED_DISHES_QUERY, {
        start: (currentPage - 1) * ADMIN_PAGE_SIZE,
        end: currentPage * ADMIN_PAGE_SIZE,
    });
    const analytics = buildAdminAnalytics(analyticsOrders, allIngredients);

    return (
        <div className="space-y-8">
            <section className="space-y-2">
                <h2 className="text-xl font-semibold">Dishes</h2>
                <p className="text-sm text-muted-foreground">
                    Add new dishes, edit existing ones, or remove dishes that have not been ordered.
                </p>
            </section>

            <section>
                <MostOrderedDishDisplay
                    dish={analytics.mostOrderedDish}
                    topDishes={analytics.topDishes}
                />
            </section>

            <section className="rounded-3xl border p-5">
                <div className="mb-5">
                    <h3 className="text-lg font-semibold">Add a dish</h3>
                    <p className="text-sm text-muted-foreground">
                        Ingredients are optional. If you select one, set the quantity used by the dish.
                    </p>
                </div>

                <form action={CreateDish} className="space-y-5">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <label className="space-y-2 text-sm">
                            <span className="text-muted-foreground">Name</span>
                            <input
                                name="name"
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                                required
                            />
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="text-muted-foreground">Price</span>
                            <input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                                required
                            />
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="text-muted-foreground">Category</span>
                            <select
                                name="category"
                                defaultValue="pica"
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                            >
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="space-y-2 text-sm">
                            <span className="text-muted-foreground">Preparation time (min)</span>
                            <input
                                name="preparationTime"
                                type="number"
                                min="0"
                                step="1"
                                className="w-full rounded-2xl border bg-background px-3 py-2"
                            />
                        </label>
                    </div>

                    <label className="block space-y-2 text-sm">
                        <span className="text-muted-foreground">Description</span>
                        <textarea
                            name="description"
                            rows={4}
                            className="w-full rounded-2xl border bg-background px-3 py-2"
                        />
                    </label>

                    <label className="block space-y-2 text-sm">
                        <span className="text-muted-foreground">Image</span>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="w-full rounded-2xl border bg-background px-3 py-2"
                        />
                    </label>

                    <div className="grid gap-3 rounded-3xl border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-3">
                        {ingredients.map((ingredient) => (
                            <label
                                key={ingredient._id}
                                className="flex items-center justify-between gap-3 rounded-2xl border bg-background px-3 py-3 text-sm"
                            >
                                <span className="min-w-0 flex-1">
                                    <span className="block font-medium">{ingredient.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {ingredient.unit || "unit"}
                                    </span>
                                </span>
                                <input type="checkbox" name="ingredientId" value={ingredient._id} />
                                <input
                                    name={`ingredientQuantity:${ingredient._id}`}
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="Qty"
                                    className="w-24 rounded-xl border bg-background px-3 py-2"
                                />
                            </label>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-6">
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="isPopular" />
                            <span>Mark as popular</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                            <input type="checkbox" name="isAvailable" defaultChecked />
                            <span>Available now</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Create dish
                    </button>
                </form>
            </section>

            <section className="rounded-3xl border p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">Existing dishes</h3>
                        <p className="text-sm text-muted-foreground">
                            Showing {dishes.length} of {totalDishes} dishes
                        </p>
                    </div>
                </div>

                {dishes.length ? (
                    <>
                        <div className="mt-5 space-y-4">
                            {dishes.map((dish) => (
                                <article key={dish._id} className="rounded-3xl border bg-muted/20 p-4">
                                    <form action={UpdateDish} className="space-y-4">
                                        <input type="hidden" name="dishId" value={dish._id} />
                                        <input type="hidden" name="currentSlug" value={dish.slug ?? ""} />

                                        <div className="flex flex-wrap items-center gap-2">
                                            <h4 className="text-lg font-semibold">{dish.name}</h4>
                                            <span className="rounded-full bg-background px-3 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                                                {dish.category || "uncategorized"}
                                            </span>
                                            <span
                                                className={`rounded-full px-3 py-1 text-xs ${
                                                    dish.isAvailable
                                                        ? "bg-emerald-100 text-emerald-800"
                                                        : "bg-amber-100 text-amber-800"
                                                }`}
                                            >
                                                {dish.isAvailable ? "Visible" : "Hidden"}
                                            </span>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            Slug: {dish.slug || "n/a"} | {dish.price ?? 0} EUR
                                            {dish.preparationTime ? ` | ${dish.preparationTime} min` : ""}
                                        </p>

                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                            <label className="space-y-2 text-sm">
                                                <span className="text-muted-foreground">Name</span>
                                                <input
                                                    name="name"
                                                    defaultValue={dish.name}
                                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                                    required
                                                />
                                            </label>

                                            <label className="space-y-2 text-sm">
                                                <span className="text-muted-foreground">Price</span>
                                                <input
                                                    name="price"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    defaultValue={dish.price ?? 0}
                                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                                    required
                                                />
                                            </label>

                                            <label className="space-y-2 text-sm">
                                                <span className="text-muted-foreground">Category</span>
                                                <select
                                                    name="category"
                                                    defaultValue={dish.category ?? "pica"}
                                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                                >
                                                    {categories.map((category) => (
                                                        <option key={category.value} value={category.value}>
                                                            {category.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>

                                            <label className="space-y-2 text-sm">
                                                <span className="text-muted-foreground">Preparation time (min)</span>
                                                <input
                                                    name="preparationTime"
                                                    type="number"
                                                    min="0"
                                                    step="1"
                                                    defaultValue={dish.preparationTime ?? ""}
                                                    className="w-full rounded-2xl border bg-background px-3 py-2"
                                                />
                                            </label>
                                        </div>

                                        <label className="block space-y-2 text-sm">
                                            <span className="text-muted-foreground">Description</span>
                                            <textarea
                                                name="description"
                                                rows={3}
                                                defaultValue={dish.description ?? ""}
                                                className="w-full rounded-2xl border bg-background px-3 py-2"
                                            />
                                        </label>

                                        <div className="grid gap-3 rounded-3xl border bg-background/70 p-4 md:grid-cols-2 xl:grid-cols-3">
                                            {ingredients.map((ingredient) => {
                                                const selectedIngredient = dish.ingredients?.find(
                                                    (dishIngredient) =>
                                                        dishIngredient.ingredient?._id === ingredient._id,
                                                );

                                                return (
                                                    <label
                                                        key={`${dish._id}-${ingredient._id}`}
                                                        className="flex items-center justify-between gap-3 rounded-2xl border bg-background px-3 py-3 text-sm"
                                                    >
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block font-medium">{ingredient.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {ingredient.unit || "unit"}
                                                            </span>
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            name="ingredientId"
                                                            value={ingredient._id}
                                                            defaultChecked={Boolean(selectedIngredient)}
                                                        />
                                                        <input
                                                            name={`ingredientQuantity:${ingredient._id}`}
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            defaultValue={selectedIngredient?.quantity ?? ""}
                                                            placeholder="Qty"
                                                            className="w-24 rounded-xl border bg-background px-3 py-2"
                                                        />
                                                    </label>
                                                );
                                            })}
                                        </div>

                                        <div className="flex flex-wrap gap-6">
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    name="isPopular"
                                                    defaultChecked={Boolean(dish.isPopular)}
                                                />
                                                <span>Mark as popular</span>
                                            </label>
                                            <label className="flex items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    name="isAvailable"
                                                    defaultChecked={dish.isAvailable !== false}
                                                />
                                                <span>Visible on menu</span>
                                            </label>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="submit"
                                                className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                                            >
                                                Save changes
                                            </button>
                                        </div>
                                    </form>

                                    <form action={DeleteDish} className="mt-3">
                                        <input type="hidden" name="dishId" value={dish._id} />
                                        <button
                                            type="submit"
                                            className="rounded-2xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </form>
                                </article>
                            ))}
                        </div>
                        <AdminPagination
                            basePath="/control/dishes"
                            currentPage={currentPage}
                            totalPages={totalPages}
                        />
                    </>
                ) : (
                    <p className="mt-4 text-muted-foreground">No dishes found yet.</p>
                )}
            </section>
        </div>
    );
}
