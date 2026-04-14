import React from 'react'

export default function RecentOrderCard({order}: {order: any}){
  return (
    <article key={order._id} className="rounded-2xl border bg-muted/30 p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="font-medium">Order #{order._id.slice(-6)}</p>
                    <p className="text-sm text-muted-foreground">
                    {[order.user?.name, order.user?.surname].filter(Boolean).join(" ") || order.user?.email || "Unknown user"}
                </p>
            </div>
            <div className="text-sm text-muted-foreground">
                    <p>{new Date(order._createdAt).toLocaleString()}</p>
                    <p className="font-medium capitalize text-foreground">
                    {order.status ?? "pending"} • {order.totalPrice ?? 0} EUR
                </p>
            </div>
        </div>
    </article>
  )
}