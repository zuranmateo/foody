import OrderCard from "@/components/cards/OrderCard";
import AdminPagination from "@/components/admin/AdminPagination";
import OrdersPerDayGraph from "@/components/graphs/OrdersPerDayGraph";
import OrderStatusBar from "@/components/graphs/OrderStatusBar";
import WeeklyRevenueGraph from "@/components/graphs/WeeklyRevenueGraph";
import { buildAdminAnalytics, type AnalyticsIngredient, type AnalyticsOrder } from "@/lib/admin-analytics";
import { ADMIN_PAGE_SIZE, getPagination, getTotalPages } from "@/lib/admin-pagination";
import {
    ADMIN_ANALYTICS_ORDERS_QUERY,
    ADMIN_ORDERS_COUNT_QUERY,
    ALL_INGREDIENTS_QUERY,
    PAGINATED_ADMIN_ORDERS_QUERY,
} from "@/sanity/lib/query";
import { writeClient } from "@/sanity/lib/write-client";
import Link from "next/link";

type OrdersPageProps = {
    searchParams: Promise<{
        status?: string;
        page?: string;
    }>;
};

type AdminOrder = {
    _id: string;
    _createdAt: string;
    totalPrice?: number;
    status?: string;
    user?: {
        _id: string;
        name?: string;
        surname?: string;
        email?: string;
    };
    items?: Array<{
        quantity?: number;
        dish?: {
            _id: string;
            name?: string;
            slug?: string;
            price?: number;
        };
    }>;
};

const filters = [
    { label: "Pending", value: "pending" },
    { label: "Preparing", value: "preparing" },
    { label: "Delivered", value: "delivered" },
    { label: "All orders", value: "all" },
];

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
    const { status, page: pageParam } = await searchParams;
    const activeFilter = filters.some((filter) => filter.value === status) ? status! : "pending";
    const pagination = getPagination(pageParam, ADMIN_PAGE_SIZE);
    const [totalOrders, analyticsOrders, ingredients] = await Promise.all([
        writeClient.fetch<number>(ADMIN_ORDERS_COUNT_QUERY, {
            status: activeFilter,
        }),
        writeClient.fetch<AnalyticsOrder[]>(ADMIN_ANALYTICS_ORDERS_QUERY),
        writeClient.fetch<AnalyticsIngredient[]>(ALL_INGREDIENTS_QUERY),
    ]);
    const totalPages = getTotalPages(totalOrders, ADMIN_PAGE_SIZE);
    const currentPage = Math.min(pagination.page, totalPages);
    const visibleOrders = await writeClient.fetch<AdminOrder[]>(PAGINATED_ADMIN_ORDERS_QUERY, {
        status: activeFilter,
        start: (currentPage - 1) * ADMIN_PAGE_SIZE,
        end: currentPage * ADMIN_PAGE_SIZE,
    });
    const analytics = buildAdminAnalytics(analyticsOrders, ingredients);

    return (
        <div className="space-y-6">
            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <WeeklyRevenueGraph data={analytics.weeklyRevenue} />
                <OrderStatusBar
                    pending={analytics.statusBreakdown.pending}
                    preparing={analytics.statusBreakdown.preparing}
                    delivered={analytics.statusBreakdown.delivered}
                />
            </section>

            <section>
                <OrdersPerDayGraph data={analytics.ordersPerDay} />
            </section>

            <section className="flex flex-wrap gap-3">
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.value;

                    return (
                        <Link
                            key={filter.value}
                            href={filter.value === "pending" ? "/control/orders" : `/control/orders?status=${filter.value}`}
                            className={`rounded-full px-4 py-2 text-sm transition-colors ${
                                isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "border bg-muted/40 hover:bg-accent"
                            }`}
                        >
                            {filter.label}
                        </Link>
                    );
                })}
            </section>

            <section className="rounded-3xl border p-5">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-xl font-semibold capitalize">{activeFilter === "all" ? "All orders" : `${activeFilter} orders`}</h2>
                        <p className="text-sm text-muted-foreground">
                            Default view focuses on pending orders so admins can react quickly.
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Showing {visibleOrders.length} of {totalOrders} orders
                    </p>
                </div>

                {visibleOrders.length ? (
                    <>
                        <div className="mt-5 space-y-4">
                            {visibleOrders.map((order) => (
                                <div key={order._id} className="space-y-3 rounded-3xl border bg-muted/20 p-4">
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
                                        <p>
                                            {[order.user?.name, order.user?.surname].filter(Boolean).join(" ") || order.user?.email || "Unknown user"}
                                        </p>
                                        <p>User ID: {order.user?._id ?? "n/a"}</p>
                                    </div>
                                    <OrderCard order={order} showStatusEditor />
                                </div>
                            ))}
                        </div>
                        <AdminPagination
                            basePath="/control/orders"
                            currentPage={currentPage}
                            totalPages={totalPages}
                            params={activeFilter === "pending" ? {} : { status: activeFilter }}
                        />
                    </>
                ) : (
                    <p className="mt-5 text-muted-foreground">No orders match this filter right now.</p>
                )}
            </section>
        </div>
    );
}
