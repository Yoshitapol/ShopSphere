import React from "react";
import Link from "next/link";
import { ExternalLink, ClipboardList } from "lucide-react";
import { OrderStatusSelect } from "@/components/dashboard/order-status-select";
import { listAllOrders } from "@/lib/prisma/order-service";
import { requireAdminUser } from "@/lib/permissions/rbac";
import { formatDateTime, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminUser("/dashboard/orders");
  const orders = await listAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Fulfillment &amp; Dispatch
          </span>
          <h2 className="text-2xl font-extrabold text-ink-900 mt-0.5">
            Customer Orders ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review incoming orders and update shipment status in real time.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card">
          <ClipboardList className="h-8 w-8 text-primary-600 mx-auto mb-2" />
          <h3 className="text-base font-extrabold text-ink-900">
            No Orders Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Orders placed through the storefront will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5 text-left">Order #</th>
                  <th className="px-4 py-3.5 text-left">Customer &amp; City</th>
                  <th className="px-4 py-3.5 text-left">Items</th>
                  <th className="px-4 py-3.5 text-left">Payment</th>
                  <th className="px-4 py-3.5 text-right">Total (INR)</th>
                  <th className="px-4 py-3.5 text-left">Fulfillment Status</th>
                  <th className="px-4 py-3.5 text-right">Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`${
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    } hover:bg-primary-50/30 transition-colors`}
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-ink-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-ink-900">
                        {order.recipientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.recipientEmail} · {order.shippingCity},{" "}
                        {order.shippingState}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items.map((item) => (
                          <div key={item.id} className="truncate text-ink-700">
                            <span className="font-bold">{item.quantity}×</span>{" "}
                            {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-ink-800">
                        {order.paymentMethod.replace("SIMULATED_", "")}
                      </div>
                      <span className="inline-block rounded-full bg-success-50 border border-success-200 px-2 py-0.5 text-[10px] font-bold text-success-700 mt-0.5">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-ink-900">
                      {formatInr(order.totalInr)}
                    </td>

                    <td className="px-4 py-3.5">
                      <OrderStatusSelect
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-primary-600 hover:bg-primary-50 transition"
                      >
                        View
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
