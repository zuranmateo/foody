"use client"
import type { TopDish } from "@/lib/admin-analytics";
import { XAxis, YAxis, LabelList, Tooltip, BarChart, ResponsiveContainer, Bar } from 'recharts';

type MostOrderedDishDisplayProps = {
    dish: TopDish | null;
    topDishes: TopDish[];
};

export default function MostOrderedDishDisplay({
    dish,
    topDishes,
}: MostOrderedDishDisplayProps) {
console.log(dish, topDishes);
    return (
        <div style={{ width: '80%', maxWidth: "400", height: 250, aspectRatio: 1.618, }} className="shadow-2xl rounded-2xl border py-5 my-5 mx-2">
                    <h2 className="text-2xl px-4">
                        MOST ORDERED DISHES
                    </h2>
                      <ResponsiveContainer>
                        <BarChart data={topDishes} margin={{ top: 20, right: 20, left: 10, bottom: 30 }}>
                          <XAxis dataKey="name"/>
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="quantity" barSize={40} color='#000000' fill='#00B7FF'>
                                      <LabelList 
                                          dataKey={"quantity"}
                                          position={'top'}
                                      />
                                    </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
    );
}
