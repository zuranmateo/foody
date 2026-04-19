import type { GraphPoint } from "@/lib/admin-analytics";
import GraphCard from "./GraphCard";

type OrdersPerDayGraphProps = {
    data: GraphPoint[];
};

export default function OrdersPerDayGraph({ data }: OrdersPerDayGraphProps) {
    const maxValue = Math.max(...data.map((point) => point.value), 1);

    return (
        <GraphCard title="Number Of Orders Per Day" description="Daily order volume for the last week.">
            <div className="flex h-64 items-end gap-3">
                {data.map((point) => {
                    const height = `${Math.max((point.value / maxValue) * 100, point.value > 0 ? 14 : 6)}%`;

                    return (
                        <div key={point.label} className="flex flex-1 flex-col items-center gap-3">
                            <p className="text-sm font-semibold">{point.value}</p>
                            <div className="flex h-full w-full items-end rounded-3xl bg-muted/50 p-2">
                                <div
                                    className="w-full rounded-2xl bg-slate-900 transition-all"
                                    style={{ height }}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">{point.label}</p>
                        </div>
                    );
                })}
            </div>
        </GraphCard>
    );
}
