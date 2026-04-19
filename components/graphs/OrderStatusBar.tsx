import GraphCard from "./GraphCard";

type OrderStatusBarProps = {
    pending: number;
    preparing: number;
    delivered: number;
};

export default function OrderStatusBar({
    pending,
    preparing,
    delivered,
}: OrderStatusBarProps) {
    const total = pending + preparing + delivered;
    const segments = [
        { label: "Pending", value: pending, color: "bg-blue-500" },
        { label: "Preparing", value: preparing, color: "bg-yellow-400" },
        { label: "Delivered", value: delivered, color: "bg-green-500" },
    ];

    return (
        <GraphCard
            title="Order Status Split"
            description="Blue is pending, yellow is preparing, and green is delivered."
            action={<p className="text-sm font-semibold">{total} total</p>}
        >
            <div className="space-y-4">
                <div className="flex h-6 overflow-hidden rounded-full bg-muted">
                    {segments.map((segment) => (
                        <div
                            key={segment.label}
                            className={segment.color}
                            style={{
                                width: total ? `${(segment.value / total) * 100}%` : "33.333%",
                            }}
                        />
                    ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                    {segments.map((segment) => (
                        <div key={segment.label} className="rounded-2xl border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 text-sm">
                                <span className={`h-3 w-3 rounded-full ${segment.color}`} />
                                <span className="text-muted-foreground">{segment.label}</span>
                            </div>
                            <p className="mt-2 text-2xl font-semibold">{segment.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </GraphCard>
    );
}
