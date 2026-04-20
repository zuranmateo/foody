"use client"
import type { GraphPoint } from "@/lib/admin-analytics";
import { LineChart, XAxis, YAxis, LabelList, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line } from 'recharts';

type OrdersPerDayGraphProps = {
    data: GraphPoint[];
};

export default function OrdersPerDayGraph({ data }: OrdersPerDayGraphProps) {

    return (
         <div style={{ width: '80%', maxWidth: "400", height: 250, aspectRatio: 1.618, }} className="shadow-2xl rounded-2xl border px-2 py-5 my-5 mx-2">
                <h2 className="text-2xl px-4">
                        ORDERS PER DAY
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
