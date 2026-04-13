import React from 'react'

export default function OrderCard({order}: {order: any}){
  return (
    <div key={order._id} className="rounded-2xl border p-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3>Order #{order._id.slice(-6)}</h3>
                    <p>{new Date(order._createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p>Status: {order.status}</p>
                    <p>Total: {order.totalPrice ?? 0} EUR</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {order.items?.map((item: any, index: any) => (
                    <div key={`${order._id}-${index}`} className="flex items-center justify-between gap-4">
                      <span>{item.dish?.name || "Dish"}</span>
                      <span>
                        {item.quantity ?? 0} x {item.dish?.price ?? 0} EUR
                      </span>
                    </div>
                  ))}
                </div>
              </div>
  )
}