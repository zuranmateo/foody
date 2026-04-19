import type { IngredientUsagePoint } from "@/lib/admin-analytics";
import GraphCard from "./GraphCard";

type IngredientUsageGraphProps = {
    data: IngredientUsagePoint[];
};

export default function IngredientUsageGraph({ data }: IngredientUsageGraphProps) {
    const maxValue = Math.max(...data.map((point) => point.value), 1);

    return (
        <GraphCard
            title="Ingredient Usage Per Week"
            description="Ingredients consumed by delivered, preparing, and pending orders over the last 7 days."
        >
            <div className="space-y-4">
                {data.length ? (
                    data.map((point) => (
                        <div key={point.label} className="space-y-2">
                            <div className="flex items-center justify-between gap-3 text-sm">
                                <p className="font-medium">{point.label}</p>
                                <p className="text-muted-foreground">
                                    {point.value.toFixed(2)} {point.unit}
                                </p>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                                <div
                                    className="h-full rounded-full bg-orange-500"
                                    style={{ width: `${Math.max((point.value / maxValue) * 100, 8)}%` }}
                                />
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">There is not enough order data yet.</p>
                )}
            </div>
        </GraphCard>
    );
}
