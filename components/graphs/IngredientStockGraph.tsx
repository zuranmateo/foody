"use client";

import type { IngredientStockPoint } from '@/lib/admin-analytics';
import { BarChart, XAxis, YAxis, LabelList, Tooltip, Legend, ResponsiveContainer, Bar } from 'recharts';

type Props = {
  data: IngredientStockPoint[];
};

export default function IngredientStockGraph({ data }: Props) {
    //console.log(data)
  return (
    <div style={{ width: '80%', maxWidth: "400", height: 250, aspectRatio: 1.618, }} className="shadow-2xl rounded-2xl border px-2 py-5 my-5 mx-2">
        <h2 className="text-2xl px-4">
                INGRIDIENT STOCK
            </h2>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
          <XAxis dataKey="label"/>
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" barSize={20} color='#000000' fill='#FF2B00'>
            <LabelList 
                dataKey={"value"}
                position={'top'}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
