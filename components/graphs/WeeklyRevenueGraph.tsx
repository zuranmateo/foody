"use client"
import { LineChart, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { GraphPoint } from '@/lib/admin-analytics';

type WeeklyRevenueGraphProps = {
    data: GraphPoint[];
};

export default function WeeklyRevenueGraph({ data }: WeeklyRevenueGraphProps) {

    return (
        <div style={{ width: '80%', maxWidth: "400", height: 250, aspectRatio: 1.618, }} className="shadow-2xl rounded-2xl border px-2 py-5 my-5 mx-2">
                <h2 className="text-2xl px-4">
                        WEEKLY REVENUE
                    </h2>
              <ResponsiveContainer>
                <LineChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
                  <XAxis dataKey="label"/>
                  <CartesianGrid strokeDasharray="3 3" />
                  <YAxis />
                  <Tooltip />
                  <Line dataKey="value" type={"monotone"} color='#000000' fill='#FF2B00'>
                    <LabelList 
                        dataKey={"value"}
                        position={'top'}
                    />
                  </Line>
                </LineChart>
              </ResponsiveContainer>
            </div>
    );
}
