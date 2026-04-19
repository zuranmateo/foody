import RecentOrderCard from "@/components/cards/RecentOrderCard";
import IngredientStockGraph from "@/components/graphs/IngredientStockGraph";
import IngredientUsageGraph from "@/components/graphs/IngredientUsageGraph";
import MostOrderedDishDisplay from "@/components/graphs/MostOrderedDishDisplay";
import OrdersPerDayGraph from "@/components/graphs/OrdersPerDayGraph";
import OrderStatusBar from "@/components/graphs/OrderStatusBar";
import WeeklyRevenueGraph from "@/components/graphs/WeeklyRevenueGraph";
import { buildAdminAnalytics, type AnalyticsIngredient, type AnalyticsOrder } from "@/lib/admin-analytics";
import {
    ADMIN_ANALYTICS_ORDERS_QUERY,
    ADMIN_DASHBOARD_STATS_QUERY,
    ADMIN_ORDERS_QUERY,
    ALL_INGREDIENTS_QUERY,
} from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";

type DashboardStats = {
    totalOrders?: number;
    pendingOrders?: number;
    preparingOrders?: number;
    deliveredOrders?: number;
    totalUsers?: number;
    totalIngredients?: number;
    outOfStockIngredients?: number;
    revenue?: number;
};

type RecentOrder = {
    _id: string;
    status?: string;
    _createdAt: string;
    totalPrice?: number;
    user?: {
        name?: string;
        surname?: string;
        email?: string;
    };
};

export default async function DashboardPage() {
    const [stats, orders, analyticsOrders, ingredients] = await Promise.all([
        writeClient.fetch<DashboardStats>(ADMIN_DASHBOARD_STATS_QUERY),
        writeClient.fetch<RecentOrder[]>(ADMIN_ORDERS_QUERY),
        writeClient.fetch<AnalyticsOrder[]>(ADMIN_ANALYTICS_ORDERS_QUERY),
        writeClient.fetch<AnalyticsIngredient[]>(ALL_INGREDIENTS_QUERY),
    ]);

    const analytics = buildAdminAnalytics(analyticsOrders, ingredients);
    const recentOrders = orders.slice(0, 5);
    const cards = [
        { label: "Total orders", value: stats?.totalOrders ?? 0 },
        { label: "Pending now", value: stats?.pendingOrders ?? 0 },
        { label: "Users", value: stats?.totalUsers ?? 0 },
        { label: "Ingredients", value: stats?.totalIngredients ?? 0 },
    ];

    return (
        <div className="space-y-8">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {cards.map((card) => (
                    <article key={card.label} className="rounded-3xl border bg-muted/40 p-5">
                        <p className="text-sm text-muted-foreground">{card.label}</p>
                        <p className="mt-3 text-3xl font-semibold">{card.value}</p>
                    </article>
                ))}
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <WeeklyRevenueGraph data={analytics.weeklyRevenue} />
                <OrderStatusBar
                    pending={analytics.statusBreakdown.pending}
                    preparing={analytics.statusBreakdown.preparing}
                    delivered={analytics.statusBreakdown.delivered}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <OrdersPerDayGraph data={analytics.ordersPerDay} />
                <MostOrderedDishDisplay
                    dish={analytics.mostOrderedDish}
                    topDishes={analytics.topDishes}
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <IngredientUsageGraph data={analytics.ingredientUsage} />
                <IngredientStockGraph data={analytics.ingredientStock} />
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-3xl border p-5">
                    <h2 className="text-xl font-semibold">Order overview</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-blue-50 p-4">
                            <p className="text-sm text-muted-foreground">Pending</p>
                            <p className="mt-2 text-2xl font-semibold">{stats?.pendingOrders ?? 0}</p>
                        </div>
                        <div className="rounded-2xl bg-yellow-50 p-4">
                            <p className="text-sm text-muted-foreground">Preparing</p>
                            <p className="mt-2 text-2xl font-semibold">{stats?.preparingOrders ?? 0}</p>
                        </div>
                        <div className="rounded-2xl bg-green-50 p-4">
                            <p className="text-sm text-muted-foreground">Delivered</p>
                            <p className="mt-2 text-2xl font-semibold">{stats?.deliveredOrders ?? 0}</p>
                        </div>
                    </div>
                </article>

                <article className="rounded-3xl border p-5">
                    <h2 className="text-xl font-semibold">Business snapshot</h2>
                    <div className="mt-4 space-y-4 text-sm">
                        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                            <span>Total revenue</span>
                            <span className="font-semibold">{stats?.revenue ?? 0} EUR</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                            <span>Revenue this week</span>
                            <span className="font-semibold">{analytics.weeklyRevenueTotal.toFixed(2)} EUR</span>
                        </div>
                        <div className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3">
                            <span>Out of stock ingredients</span>
                            <span className="font-semibold">{stats?.outOfStockIngredients ?? 0}</span>
                        </div>
                    </div>
                </article>
            </section>

            <section className="rounded-3xl border p-5">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xl font-semibold">Recent orders</h2>
                    <p className="text-sm text-muted-foreground">Last {recentOrders.length} orders</p>
                </div>

                {recentOrders.length ? (
                    <div className="mt-4 space-y-3">
                        {recentOrders.map((order) => (
                            <RecentOrderCard key={order._id} order={order}/>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-muted-foreground">There are no orders yet.</p>
                )}
            </section>
        </div>
    );
}
