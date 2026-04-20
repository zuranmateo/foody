type AnalyticsIngredientRef = {
    _id: string;
    name?: string;
    unit?: string;
};

type AnalyticsDishIngredient = {
    quantity?: number;
    ingredient?: AnalyticsIngredientRef;
};

type AnalyticsDish = {
    _id: string;
    name?: string;
    price?: number;
    ingredients?: AnalyticsDishIngredient[];
};

type AnalyticsOrderItem = {
    quantity?: number;
    dish?: AnalyticsDish;
};

export type AnalyticsOrder = {
    _id: string;
    _createdAt: string;
    totalPrice?: number;
    status?: string;
    items?: AnalyticsOrderItem[];
};

export type AnalyticsIngredient = {
    _id: string;
    name: string;
    quantity?: number;
    unit?: string;
    inStock?: boolean;
};

export type GraphPoint = {
    label: string;
    value: number;
};

export type IngredientUsagePoint = GraphPoint & {
    unit: string;
};

export type IngredientStockPoint = GraphPoint & {
    unit: string;
    inStock: boolean;
};

export type TopDish = {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
};

export type AdminAnalytics = {
    weeklyRevenue: GraphPoint[];
    ordersPerDay: GraphPoint[];
    ingredientUsage: IngredientUsagePoint[];
    ingredientStock: IngredientStockPoint[];
    mostOrderedDish: TopDish | null;
    topDishes: TopDish[];
    statusBreakdown: {
        pending: number;
        preparing: number;
        delivered: number;
        total: number;
    };
    weeklyRevenueTotal: number;
};

const DAY_RANGE = 7;

function formatDayLabel(date: Date) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: "UTC",
    }).format(date);
}

function startOfUtcDay(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function shiftUtcDays(date: Date, days: number) {
    const shifted = new Date(date);
    shifted.setUTCDate(shifted.getUTCDate() + days);
    return shifted;
}

function dateKey(date: Date) {
    return date.toISOString().slice(0, 10);
}

export function buildAdminAnalytics(
    orders: AnalyticsOrder[],
    ingredients: AnalyticsIngredient[],
): AdminAnalytics {
    const today = startOfUtcDay(new Date());
    const firstDay = shiftUtcDays(today, -(DAY_RANGE - 1));
    const days = Array.from({ length: DAY_RANGE }, (_, index) => {
        const day = shiftUtcDays(firstDay, index);

        return {
            key: dateKey(day),
            label: formatDayLabel(day),
        };
    });

    const weeklyRevenueMap = new Map(days.map((day) => [day.key, 0]));
    const ordersPerDayMap = new Map(days.map((day) => [day.key, 0]));
    const ingredientUsageMap = new Map<string, IngredientUsagePoint>();
    const dishTotals = new Map<string, TopDish>();

    const statusBreakdown = {
        pending: 0,
        preparing: 0,
        delivered: 0,
        total: orders.length,
    };

    for (const order of orders) {
        const normalizedStatus = order.status ?? "pending";

        if (normalizedStatus === "pending") statusBreakdown.pending += 1;
        if (normalizedStatus === "preparing") statusBreakdown.preparing += 1;
        if (normalizedStatus === "delivered") statusBreakdown.delivered += 1;

        const orderDate = startOfUtcDay(new Date(order._createdAt));
        const orderDateKey = dateKey(orderDate);
        const isInWindow = weeklyRevenueMap.has(orderDateKey);

        if (isInWindow) {
            weeklyRevenueMap.set(orderDateKey, (weeklyRevenueMap.get(orderDateKey) ?? 0) + (order.totalPrice ?? 0));
            ordersPerDayMap.set(orderDateKey, (ordersPerDayMap.get(orderDateKey) ?? 0) + 1);
        }

        for (const item of order.items ?? []) {
            const quantity = item.quantity ?? 0;
            const dish = item.dish;

            if (!dish?._id) {
                continue;
            }

            const existingDish = dishTotals.get(dish._id) ?? {
                id: dish._id,
                name: dish.name ?? "Unknown dish",
                quantity: 0,
                revenue: 0,
            };

            existingDish.quantity += quantity;
            existingDish.revenue += (dish.price ?? 0) * quantity;
            dishTotals.set(dish._id, existingDish);

            if (!isInWindow) {
                continue;
            }

            for (const dishIngredient of dish.ingredients ?? []) {
                const ingredient = dishIngredient.ingredient;

                if (!ingredient?._id) {
                    continue;
                }

                const usage = (dishIngredient.quantity ?? 0) * quantity;
                const existingUsage = ingredientUsageMap.get(ingredient._id) ?? {
                    label: ingredient.name ?? "Unknown ingredient",
                    value: 0,
                    unit: ingredient.unit ?? "unit",
                };

                existingUsage.value += usage;
                ingredientUsageMap.set(ingredient._id, existingUsage);
            }
        }
    }

    const weeklyRevenue = days.map((day) => ({
        label: day.label,
        value: Number((weeklyRevenueMap.get(day.key) ?? 0).toFixed(2)),
    }));

    const ordersPerDay = days.map((day) => ({
        label: day.label,
        value: ordersPerDayMap.get(day.key) ?? 0,
    }));

    const ingredientUsage = Array.from(ingredientUsageMap.values())
        .sort((a, b) => b.value - a.value)
        .slice(0, 6)
        .map((item) => ({
            ...item,
            value: Number(item.value.toFixed(2)),
        }));

    const ingredientStock = [...ingredients]
        .sort((a, b) => {
            if (a.inStock !== b.inStock) {
                return a.inStock ? 1 : -1;
            }

            return (a.quantity ?? 0) - (b.quantity ?? 0);
        })
        .slice(0, 6)
        .map((ingredient) => ({
            label: ingredient.name,
            value: Number((ingredient.quantity ?? 0).toFixed(2)),
            unit: ingredient.unit ?? "unit",
            inStock: ingredient.inStock === true,
        }));

    const topDishes = Array.from(dishTotals.values()).sort((a, b) => {
        if (b.quantity !== a.quantity) {
            return b.quantity - a.quantity;
        }

        return b.revenue - a.revenue;
    });

    return {
        weeklyRevenue,
        ordersPerDay,
        ingredientUsage,
        ingredientStock,
        mostOrderedDish: topDishes[0] ?? null,
        topDishes: topDishes.slice(0, 4),
        statusBreakdown,
        weeklyRevenueTotal: Number(
            weeklyRevenue.reduce((sum, point) => sum + point.value, 0).toFixed(2),
        ),
    };
}
