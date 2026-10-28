// ============================================================================
// ShopSphere Dynamic Order Detail & Confirmation Page (/orders/[id])
// Experiment 1: Async Dynamic Route Params
// Experiment 5: Displays Persisted Relational Order & OrderItems
// Experiment 8: Enforces Server-Boundary Order Ownership (Prevents URL Tampering)
// ============================================================================
import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CreditCard,
  Database,
  ShieldCheck,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { requireAuthenticatedUser } from "@/lib/permissions/rbac";
import {
  ForbiddenOrderAccessError,
  getOrderByIdForUser,
} from "@/lib/prisma/order-service";
import { formatDateTime, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ placed?: string }>;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await params;
  const { placed } = await searchParams;

  const user = await requireAuthenticatedUser(`/orders/${id}`);

  let order;
  try {
    order = await getOrderByIdForUser(id, user);
  } catch (err) {
    if (err instanceof ForbiddenOrderAccessError) {
      redirect(`/access-denied?reason=order-ownership&orderId=${encodeURIComponent(id)}`);
    }
    throw err;
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Orders
        </Link>

        <span className="rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1 text-xs font-bold text-indigo-700">
          Status: {order.status}
        </span>
      </div>

      {/* Newly Placed Order Confirmation Banner */}
      {placed === "true" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 flex items-start gap-3.5 shadow-sm">
          <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-emerald-950">
              Order Confirmed! Checkout Transaction Committed Successfully
            </h2>
            <p className="text-xs text-emerald-800 leading-relaxed">
              Your simulated order{" "}
              <strong className="font-mono">{order.orderNumber}</strong> has
              been persisted, warehouse stock quantities have been decremented,
              and your GST invoice breakdown is ready below.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Transactional Order Receipt
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-0.5 font-mono">
              {order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Order ID: <code className="font-mono">{order.id}</code> • Placed
              on {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <Database className="h-3.5 w-3.5 text-indigo-600" />
              {order.transactionMode === "mysql-prisma-transaction"
                ? "MySQL Prisma $transaction"
                : "Atomic Persistent Store Transaction"}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ownership Verified for {user.email}
            </span>
          </div>
        </div>

        {/* Shipping & Payment Info Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-indigo-600" />
              Shipping Destination
            </h3>
            <p className="font-bold text-slate-800 text-sm pt-1">
              {order.recipientName}
            </p>
            <p className="text-slate-600">{order.shippingAddress}</p>
            <p className="text-slate-600">
              {order.shippingCity}, {order.shippingState} -{" "}
              <span className="font-mono font-semibold">
                {order.shippingPincode}
              </span>
            </p>
            <p className="text-slate-500 pt-1">
              Phone: {order.recipientPhone} • Email: {order.recipientEmail}
            </p>
            {order.notes && (
              <p className="text-indigo-700 italic pt-1">
                Note: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-1.5 text-xs">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5 text-indigo-600" />
              Simulated Payment Summary
            </h3>
            <div className="pt-1 space-y-1">
              <p className="text-slate-600">
                Method:{" "}
                <strong className="text-slate-900">
                  {order.paymentMethod}
                </strong>
              </p>
              <p className="text-slate-600">
                Payment Status:{" "}
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[11px] font-bold text-emerald-800">
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 pt-2">
                Note: This is an academic demonstration order. Payment status is
                simulated without charging any real banking instrument.
              </p>
            </div>
          </div>
        </div>

        {/* Order Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900">
            Ordered Line Items ({order.items.length})
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left hidden sm:table-cell">
                    SKU / Catalog ID
                  </th>
                  <th className="px-4 py-3 text-right">Unit Price</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          <ProductImage
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full"
                          />
                        </div>
                        <Link
                          href={`/products/${item.productSlug}`}
                          className="font-bold text-slate-900 hover:text-indigo-600"
                        >
                          {item.productName}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden sm:table-cell">
                      <div>{item.sku}</div>
                      <div className="text-[10px] text-slate-400">
                        {item.catalogProductId}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {formatInr(item.unitPriceInr)}
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                      {formatInr(item.lineTotalInr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals Breakdown */}
        <div className="flex justify-end border-t border-slate-100 pt-4">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-slate-900">
                {formatInr(order.subtotalInr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span className="font-semibold text-slate-900">
                {formatInr(order.taxInr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-semibold text-emerald-700">
                {order.shippingInr === 0 ? "FREE" : formatInr(order.shippingInr)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-extrabold text-slate-900">
              <span>Total Paid (INR)</span>
              <span className="text-indigo-600">
                {formatInr(order.totalInr)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
