import type { TopDish } from "@/lib/admin-analytics";
import GraphCard from "./GraphCard";

type MostOrderedDishDisplayProps = {
    dish: TopDish | null;
    topDishes: TopDish[];
};

export default function MostOrderedDishDisplay({
    dish,
    topDishes,
}: MostOrderedDishDisplayProps) {
    return (
        <GraphCard
            title="Most Ordered Dish"
            description="Best performer based on ordered quantity."
        >
            {dish ? (
                <div className="space-y-5">
                    <div className="rounded-[2rem] bg-gradient-to-br from-sky-500 via-cyan-500 to-emerald-500 p-5 text-white">
                        <p className="text-xs uppercase tracking-[0.25em] text-white/70">Top dish</p>
                        <h4 className="mt-3 text-2xl font-semibold">{dish.name}</h4>
                        <div className="mt-5 flex flex-wrap gap-3 text-sm">
                            <span className="rounded-full bg-white/15 px-3 py-1">
                                {dish.quantity} portions ordered
                            </span>
                            <span className="rounded-full bg-white/15 px-3 py-1">
                                {dish.revenue.toFixed(2)} EUR revenue
                            </span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        {topDishes.map((entry, index) => (
                            <div
                                key={entry.id}
                                className="flex items-center justify-between rounded-2xl bg-muted/40 px-4 py-3 text-sm"
                            >
                                <p>
                                    <span className="mr-2 text-muted-foreground">#{index + 1}</span>
                                    {entry.name}
                                </p>
                                <p className="font-medium">{entry.quantity} orders</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No dish has been ordered yet.</p>
            )}
        </GraphCard>
    );
}
