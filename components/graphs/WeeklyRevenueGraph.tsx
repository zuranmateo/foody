import type { GraphPoint } from "@/lib/admin-analytics";
import GraphCard from "./GraphCard";

type WeeklyRevenueGraphProps = {
    data: GraphPoint[];
};

export default function WeeklyRevenueGraph({ data }: WeeklyRevenueGraphProps) {
    const maxValue = Math.max(...data.map((point) => point.value), 1);
    const width = 100;
    const height = 44;
    const points = data
        .map((point, index) => {
            const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
            const y = height - (point.value / maxValue) * height;

            return `${x},${y}`;
        })
        .join(" ");
    const areaPath = `0,${height} ${points} ${width},${height}`;
    const total = data.reduce((sum, point) => sum + point.value, 0);

    return (
        <GraphCard
            title="Total Revenue Weekly"
            description="Revenue collected over the last 7 days."
            action={<p className="text-sm font-semibold">{total.toFixed(2)} EUR</p>}
        >
            <div className="space-y-4">
                <svg viewBox={`0 0 ${width} ${height + 2}`} className="h-48 w-full overflow-visible">
                    <defs>
                        <linearGradient id="revenue-fill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#0f766e" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.04" />
                        </linearGradient>
                    </defs>
                    <polygon points={areaPath} fill="url(#revenue-fill)" />
                    <polyline
                        points={points}
                        fill="none"
                        stroke="#0f766e"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    {data.map((point, index) => {
                        const x = data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
                        const y = height - (point.value / maxValue) * height;

                        return <circle key={point.label} cx={x} cy={y} r="1.8" fill="#134e4a" />;
                    })}
                </svg>

                <div className="grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
                    {data.map((point) => (
                        <div key={point.label} className="space-y-1">
                            <p className="font-medium text-foreground">{point.label}</p>
                            <p>{point.value.toFixed(0)} EUR</p>
                        </div>
                    ))}
                </div>
            </div>
        </GraphCard>
    );
}
