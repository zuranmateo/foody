import type { IngredientStockPoint } from "@/lib/admin-analytics";
import GraphCard from "./GraphCard";

type IngredientStockGraphProps = {
    data: IngredientStockPoint[];
};

export default function IngredientStockGraph({ data }: IngredientStockGraphProps) {
    const maxValue = Math.max(...data.map((point) => point.value), 1);

    return (
        <GraphCard
            title="Ingredient Stock Graph"
            description="Lowest stock ingredients, with out-of-stock items surfaced first."
        >
            <div className="space-y-3">
                {data.length ? (
                    data.map((point) => (
                        <div
                            key={point.label}
                            className={`rounded-2xl border px-4 py-3 ${
                                point.inStock ? "bg-emerald-50/60" : "bg-rose-50/70"
                            }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <div>
                                    <p className="font-medium">{point.label}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {point.inStock ? "In stock" : "Restock needed"}
                                    </p>
                                </div>
                                <p className="text-sm font-semibold">
                                    {point.value.toFixed(2)} {point.unit}
                                </p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/80">
                                <div
                                    className={`h-full rounded-full ${
                                        point.inStock ? "bg-emerald-500" : "bg-rose-500"
                                    }`}
                                    style={{ width: `${Math.max((point.value / maxValue) * 100, point.value > 0 ? 10 : 4)}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">No ingredient data is available yet.</p>
                )}
            </div>
        </GraphCard>
    );
}
