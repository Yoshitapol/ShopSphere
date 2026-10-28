import React from "react";
import Link from "next/link";
import {
  ClipboardList,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Lock,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Breadcrumb } from "@/components/ui/storefront-helpers";
import { requireAuthenticatedUser } from "@/lib/permissions/rbac";
import { listOrdersForUser } from "@/lib/prisma/order-service";
import { formatDateTime, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "DELIVERED":
      return "bg-success-50 text-success-700 border-success-200";
    case "SHIPPED":
      return "bg-primary-50 text-primary-700 border-primary-200";
    case "PROCESSING":
    case "CONFIRMED":
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    case "CANCELLED":
      return "bg-danger-50 text-danger-700 border-danger-200";
    default:
      return "bg-warning-50 text-warning-800 border-warning-200";
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Breadcrumb items={[{ label: "My Orders" }]} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
            My Orders ({orders.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track deliveries, download GST invoices, and manage returns for{" "}
            <strong className="font-semibold text-ink-800">{user.email}</strong>
          </p>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition self-start sm:self-auto"
        >
          Continue Shopping
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card max-w-lg mx-auto my-8 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
            <ClipboardList className="h-8 w-8" />
          </div>
          <h2 className="text-lg font-extrabold text-ink-900">
            You Haven&apos;t Placed Any Orders Yet
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Once you place an order, you can track its live shipping status and
            view your itemized receipt here.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card hover:border-slate-300 transition"
            >
              {/* Order Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-3.5">
                <div className="flex flex-wrap items-center gap-6 text-xs">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Order Placed
                    </span>
                    <span className="font-semibold text-ink-800">
                      {formatDateTime(order.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Total Amount
                    </span>
                    <span className="font-extrabold text-ink-900 text-sm">
                      {formatInr(order.totalInr)}
                    </span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Ship To
                    </span>
                    <span className="font-semibold text-ink-800 inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-slate-400" />
                      {order.recipientName} ({order.shippingCity})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    #{order.orderNumber}
                  </span>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-extrabold ${getStatusBadgeClass(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-3.5 py-2 text-xs font-bold text-white hover:bg-primary-600 transition"
                  >
                    View Details
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {/* Order Items with Thumbnails */}
              <div className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs"
                    >
                      <Link
                        href={`/products/${item.productSlug}`}
                        className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1"
                      >
                        <ProductImage
                          src={item.productImage}
                          alt={item.productName}
                          fit="contain"
                          className="h-full w-full"
                        />
                      </Link>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-bold text-ink-900 hover:text-primary-600 truncate block"
                        >
                          {item.productName}
                        </Link>
                        <p className="text-slate-500">
                          Qty: {item.quantity} × {formatInr(item.unitPriceInr)}
                        </p>
                        <p className="font-extrabold text-ink-800">
                          {formatInr(item.lineTotalInr)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
                  <span>
                    Delivery Address:{" "}
                    <strong className="text-ink-800">
                      {order.shippingAddress}, {order.shippingCity},{" "}
                      {order.shippingState} - {order.shippingPincode}
                    </strong>
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-success-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Payment: {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Subtle Security Privacy Verification Link at Bottom */}
      {user.role === "CUSTOMER" && (
        <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Lock className="h-3.5 w-3.5 text-primary-600 shrink-0" />
            <span>
              Your orders are private to your account ({user.email}).
            </span>
          </div>
          <Link
            href={`/orders/${otherCustomerDemoOrderId}`}
            className="text-xs font-semibold text-slate-400 hover:text-primary-600 underline"
          >
            Verify privacy protection →
          </Link>
        </div>
      )}
    </div>
  );
}
