// ============================================================================
// ShopSphere Customer Order History Page (/orders)
// Experiment 5 & 8: Authenticated Customer Order Listing & Ownership Scoping
// ============================================================================
import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  ArrowRight,
  Package,
  ShieldCheck,
  Lock,
} from "lucide-react";
import { requireAuthenticatedUser } from "@/lib/permissions/rbac";
import { listOrdersForUser } from "@/lib/prisma/order-service";
import { formatDateTime, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "SHIPPED":
      return "bg-indigo-100 text-indigo-800 border-indigo-200";
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "CANCELLED":
      return "bg-rose-100 text-rose-800 border-rose-200";
    default:
      return "bg-amber-100 text-amber-800 border-amber-200";
  }
}

export default async function CustomerOrdersPage() {
  const user = await requireAuthenticatedUser("/orders");
  const orders = await listOrdersForUser(user);

  const otherCustomerDemoOrderId =
    user.email === "priya.nair@shopsphere.in"
      ? "ord_sample_1002"
      : "ord_sample_1001";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            MySQL Transactional Order History
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            My Orders ({orders.length})
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Showing orders placed by{" "}
            <strong className="font-semibold text-slate-900">
              {user.name}
            </strong>{" "}
            ({user.email}).
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          Continue Shopping
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Experiment 8 Viva Verification Banner: Test Cross-Customer Order URL Protection */}
      {user.role === "CUSTOMER" && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 text-xs text-slate-700">
            <Lock className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-indigo-950">
                Experiment 8 Viva Verification: Order Ownership Boundary (IDOR
                Protection)
              </p>
              <p className="mt-0.5">
                You are signed in as{" "}
                <strong className="text-slate-900">{user.email}</strong>. Click
                the test link to verify that attempting to open another
                customer&apos;s order URL (
                <code className="font-mono text-indigo-700">
                  /orders/{otherCustomerDemoOrderId}
                </code>
                ) is blocked on the server.
              </p>
            </div>
          </div>
          <Link
            href={`/orders/${otherCustomerDemoOrderId}`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-300 bg-white px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 shrink-0 self-start sm:self-center transition"
          >
            Test Unauthorized Order URL
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No Orders Placed Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Add products to your cart and complete the simulated checkout to see
            your transactional orders here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="block text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      Order Number
                    </span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {order.orderNumber}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      Placed On
                    </span>
                    <span className="font-medium text-slate-700">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-400 uppercase font-bold tracking-wider text-[10px]">
                      Total Paid (Simulated)
                    </span>
                    <span className="font-extrabold text-indigo-600 text-sm">
                      {formatInr(order.totalInr)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-600 transition"
                  >
                    View Order Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                      >
                        {item.productName}
                      </Link>
                      <p className="text-slate-500">
                        Qty: {item.quantity} × {formatInr(item.unitPriceInr)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 pt-1">
                <span>
                  Delivering to:{" "}
                  <strong className="text-slate-700">
                    {order.recipientName}, {order.shippingCity},{" "}
                    {order.shippingState} - {order.shippingPincode}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {order.paymentMethod} ({order.paymentStatus})
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
