"use client"
import { XAxis, YAxis, LabelList, Tooltip, BarChart, ResponsiveContainer, Bar } from 'recharts';

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
    const segments = [
        { label: "Pending", value: pending, color: "#3b82f6" },
        { label: "Preparing", value: preparing, color: "#eab308" },
        { label: "Delivered", value: delivered, color: "#22c55e" },
    ];
    return (
        <div style={{ width: '80%', maxWidth: "400", height: 250, aspectRatio: 1.618, }} className="shadow-2xl rounded-2xl border py-5 my-5 mx-2">
                    <h2 className="text-2xl px-4">
                        MOST ORDERED DISHES
                    </h2>
                      <ResponsiveContainer>
                        <BarChart data={segments} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
                          <XAxis dataKey="label"/>
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="value"
                            barSize={40}
                            shape={(props: any) => {
                                const { x, y, width, height, payload } = props;

                                return (
                                <rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    fill={payload.color}
                                />
                                );
                            }}
                            >
                            <LabelList 
                                dataKey="value"
                                position="top"
                            />
                            </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
    );
}
