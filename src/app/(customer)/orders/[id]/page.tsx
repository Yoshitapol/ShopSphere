import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  CreditCard,
  ShieldCheck,
  Package,
  Truck,
  XCircle,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { Breadcrumb } from "@/components/ui/storefront-helpers";
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

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Order Placed" },
  { key: "CONFIRMED", label: "Confirmed" },
  { key: "PROCESSING", label: "Packed" },
  { key: "SHIPPED", label: "Shipped" },
  { key: "DELIVERED", label: "Delivered" },
];

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
      redirect(
        `/access-denied?reason=order-ownership&orderId=${encodeURIComponent(id)}`
      );
    }
    throw err;
  }

  if (!order) {
    notFound();
  }

  const currentStepIndex = TIMELINE_STEPS.findIndex(
    (s) => s.key === order.status
  );
  const isCancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: "My Orders", href: "/orders" },
            { label: `Order #${order.orderNumber}` },
          ]}
        />

        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to My Orders
        </Link>
      </div>

      {/* Newly Placed Order Confirmation Banner */}
      {placed === "true" && (
        <div className="rounded-2xl border border-success-200 bg-success-50 p-5 flex items-start gap-3.5 shadow-sm">
          <CheckCircle2 className="h-6 w-6 text-success-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-success-800">
              Thank You! Your Order #{order.orderNumber} is Confirmed
            </h2>
            <p className="text-xs text-success-700 leading-relaxed">
              We&apos;ve sent a confirmation email to{" "}
              <strong>{order.recipientEmail}</strong>. Your items are being
              prepared for express dispatch.
            </p>
          </div>
        </div>
      )}

      {/* Main Order Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
              Official Order Receipt &amp; Tax Invoice
            </span>
            <h1 className="text-2xl font-extrabold text-ink-900 mt-0.5">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Placed on {formatDateTime(order.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold ${
                isCancelled
                  ? "bg-danger-50 text-danger-700 border border-danger-200"
                  : order.status === "DELIVERED"
                  ? "bg-success-50 text-success-700 border border-success-200"
                  : "bg-primary-50 text-primary-700 border border-primary-200"
              }`}
            >
              <Truck className="h-3.5 w-3.5" />
              {order.status}
            </span>
            <span className="text-[11px] text-success-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Purchase • {user.email}
            </span>
          </div>
        </div>

        {/* Visual Order Status Timeline Tracker */}
        {isCancelled ? (
          <div className="flex items-center gap-3 rounded-xl border border-danger-200 bg-danger-50 p-4 text-xs font-bold text-danger-700">
            <XCircle className="h-5 w-5 shrink-0" />
            <span>This order was cancelled.</span>
          </div>
        ) : (
          <div className="py-2">
            <ol className="grid grid-cols-5 gap-2">
              {TIMELINE_STEPS.map((step, idx) => {
                const reached = idx <= (currentStepIndex === -1 ? 1 : currentStepIndex);
                return (
                  <li key={step.key} className="flex flex-col items-center text-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold transition-colors ${
                        reached
                          ? "bg-success-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-400 border border-slate-200"
                      }`}
                    >
                      {reached ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        idx + 1
                      )}
                    </div>
                    <span
                      className={`mt-2 text-[11px] font-bold ${
                        reached ? "text-ink-900" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        {/* Shipping & Payment Info Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5 text-xs">
            <h3 className="font-bold text-ink-900 flex items-center gap-1.5 uppercase tracking-wider">
              <MapPin className="h-3.5 w-3.5 text-primary-600" />
              Delivery Address
            </h3>
            <p className="font-bold text-ink-900 text-sm pt-1">
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
              <p className="text-primary-700 italic pt-1">
                Instructions: &ldquo;{order.notes}&rdquo;
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 space-y-1.5 text-xs">
            <h3 className="font-bold text-ink-900 flex items-center gap-1.5 uppercase tracking-wider">
              <CreditCard className="h-3.5 w-3.5 text-primary-600" />
              Payment Information
            </h3>
            <div className="pt-1 space-y-1.5">
              <p className="text-slate-600">
                Payment Mode:{" "}
                <strong className="text-ink-900">
                  {order.paymentMethod.replace("SIMULATED_", "")}
                </strong>
              </p>
              <p className="text-slate-600">
                Payment Status:{" "}
                <span className="rounded-md bg-success-100 px-2 py-0.5 text-[11px] font-bold text-success-800">
                  {order.paymentStatus}
                </span>
              </p>
              <p className="text-[11px] text-slate-500 pt-1">
                Includes 18% GST invoice eligible for business input tax credit.
              </p>
            </div>
          </div>
        </div>

        {/* Order Line Items Table */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-ink-900 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary-600" />
            Items in Your Order ({order.items.length})
          </h3>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Item</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-center">Qty</th>
                  <th className="px-4 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                          <ProductImage
                            src={item.productImage}
                            alt={item.productName}
                            fit="contain"
                            className="h-full w-full"
                          />
                        </div>
                        <div>
                          <Link
                            href={`/products/${item.productSlug}`}
                            className="font-bold text-ink-900 hover:text-primary-600"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Model: {item.sku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {formatInr(item.unitPriceInr)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-ink-900">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-right font-extrabold text-ink-900">
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
          <div className="w-full max-w-xs space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-ink-900">
                {formatInr(order.subtotalInr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (18%)</span>
              <span className="font-semibold text-ink-900">
                {formatInr(order.taxInr)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping</span>
              <span className="font-bold text-success-700">
                {order.shippingInr === 0
                  ? "FREE"
                  : formatInr(order.shippingInr)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base font-extrabold text-ink-900">
              <span>Grand Total</span>
              <span className="text-primary-600">
                {formatInr(order.totalInr)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
