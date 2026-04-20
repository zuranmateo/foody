import { UpdateOrderStatus } from '@/lib/admin-actions'
import ReceiptDownloadButton from '@/components/receipt/ReceiptDownloadButton'
import React from 'react'

export default function OrderCard({
  order,
  showStatusEditor = false,
}: {
  order: any;
  showStatusEditor?: boolean;
}){
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

                {showStatusEditor ? (
                  <form action={UpdateOrderStatus} className="mt-4 flex flex-col gap-3 rounded-2xl bg-muted/30 p-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2">
                      <label htmlFor={`status-${order._id}`} className="text-sm text-muted-foreground">
                        Update order status
                      </label>
                      <input type="hidden" name="orderId" value={order._id} />
                      <input type="hidden" name="userId" value={order.user?._id ?? ""} />
                      <select
                        id={`status-${order._id}`}
                        name="status"
                        defaultValue={order.status ?? "pending"}
                        className="rounded-2xl border bg-background px-3 py-2"
                      >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="delivered">Delivered</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                      Save status
                    </button>
                  </form>
                ) : null}

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

                <div className="mt-4">
                  <ReceiptDownloadButton
                    orderId={order._id}
                    label="Download receipt PDF"
                    size="sm"
                  />
                </div>
              </div>
  )
}
