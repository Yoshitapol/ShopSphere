// ============================================================================
// ShopSphere Admin Order Management Page (/dashboard/orders)
// Experiment 2, 5 & 14: Responsive Order Table & Live Status Updates
// ============================================================================
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
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Experiment 5 &amp; 8: MySQL Relational Order Operations
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Customer Orders ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View all marketplace orders and update fulfillment status in real
            time.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <ClipboardList className="h-8 w-8 text-indigo-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-900">
            No Orders Recorded Yet
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Orders placed through the checkout flow will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5 text-left">Order #</th>
                  <th className="px-4 py-3.5 text-left">Customer &amp; City</th>
                  <th className="px-4 py-3.5 text-left">Items</th>
                  <th className="px-4 py-3.5 text-left">Payment (Simulated)</th>
                  <th className="px-4 py-3.5 text-right">Total (INR)</th>
                  <th className="px-4 py-3.5 text-left">Update Status</th>
                  <th className="px-4 py-3.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-slate-50/70 transition"
                  >
                    <td className="px-4 py-3.5">
                      <div className="font-mono font-bold text-slate-900">
                        {order.orderNumber}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {formatDateTime(order.createdAt)}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">
                        {order.recipientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.recipientEmail} • {order.shippingCity},{" "}
                        {order.shippingState}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 max-w-xs">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="truncate text-slate-700"
                          >
                            <span className="font-bold">{item.quantity}×</span>{" "}
                            {item.productName}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="font-medium text-slate-800">
                        {order.paymentMethod}
                      </div>
                      <span className="inline-block rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-800 mt-0.5">
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
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
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition"
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
