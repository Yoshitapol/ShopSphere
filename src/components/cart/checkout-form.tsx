"use client";

// ============================================================================
// ShopSphere Simulated Transactional Checkout Form Component
// Experiment 4: Server Action Form Submission with Zod Validation
// Experiment 5: Triggers MySQL ACID Checkout Transaction
// Experiment 14: Clearly Labelled Simulated Payment Gateway
// ============================================================================
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { placeOrderServerAction } from "@/actions/order-actions";
import { formatInr } from "@/lib/utils/format";
import type { AppUser } from "@/types";

interface CheckoutFormProps {
  user: AppUser;
}

export function CheckoutForm({ user }: CheckoutFormProps) {
  const router = useRouter();
  const {
    items,
    isHydrated,
    totalItems,
    subtotalInr,
    taxInr,
    shippingInr,
    grandTotalInr,
    clearCart,
  } = useCart();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [recipientName, setRecipientName] = useState(
    user.name.replace(/\s*\(.*?\)\s*/g, "")
  );
  const [recipientEmail, setRecipientEmail] = useState(user.email);
  const [recipientPhone, setRecipientPhone] = useState(
    user.phone || "+91 98450 77812"
  );
  const [shippingAddress, setShippingAddress] = useState(
    "Flat 402, Emerald Heights, 12th Main Road, Indiranagar"
  );
  const [shippingCity, setShippingCity] = useState("Bengaluru");
  const [shippingState, setShippingState] = useState("Karnataka");
  const [shippingPincode, setShippingPincode] = useState("560038");
  const [paymentMethod, setPaymentMethod] = useState<
    "SIMULATED_UPI" | "SIMULATED_CARD" | "SIMULATED_NETBANKING" | "SIMULATED_COD"
  >("SIMULATED_UPI");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  if (!isHydrated) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Preparing checkout session...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-8 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          Add products to your cart before proceeding to transactional checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    startTransition(async () => {
      const result = await placeOrderServerAction({
        recipientName,
        recipientEmail,
        recipientPhone,
        shippingAddress,
        shippingCity,
        shippingState,
        shippingPincode,
        paymentMethod,
        notes,
        items: items.map((i) => ({
          catalogProductId: i.catalogProductId,
          quantity: i.quantity,
        })),
      });

      if (!result.ok || !result.data) {
        setErrorMessage(result.message);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        showToast(result.message, "error");
        return;
      }

      clearCart();
      showToast(result.message, "success");
      router.push(`/orders/${result.data.id}?placed=true`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleCheckoutSubmit} className="space-y-6">
      {/* Simulated Payment Banner */}
      <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-indigo-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 space-y-0.5">
            <p className="font-bold text-indigo-950">
              Academic Demo Mode: Simulated Payment &amp; Real Database Transaction
            </p>
            <p>
              No real money or external payment gateway is charged. Submitting
              this form executes a server-side ACID checkout transaction that
              verifies stock, decrements inventory, and persists your order.
            </p>
          </div>
        </div>
        <span className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white shrink-0 self-start sm:self-center">
          SIMULATED GATEWAY
        </span>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Checkout Transaction Aborted</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Shipping & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-900">
              1. Delivery Address (India)
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Recipient Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
                />
                {fieldErrors.recipientName && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.recipientName[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+91 98450 77812"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
                />
                {fieldErrors.recipientPhone && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.recipientPhone[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Email for Order Confirmation *
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
                />
                {fieldErrors.recipientEmail && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.recipientEmail[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Flat / House No., Building, Street *
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
                />
                {fieldErrors.shippingAddress && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.shippingAddress[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900"
                />
                {fieldErrors.shippingCity && (
                  <p className="mt-1 text-xs text-rose-600">
                    {fieldErrors.shippingCity[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-mono text-slate-900"
                  />
                  {fieldErrors.shippingPincode && (
                    <p className="mt-1 text-xs text-rose-600">
                      {fieldErrors.shippingPincode[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Leave package with building security guard"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selection (Simulated) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-indigo-600" />
                2. Simulated Payment Method
              </h2>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Instant Simulated Approval
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "SIMULATED_UPI",
                  title: "Simulated UPI Instant Pay",
                  subtitle: "GPay / PhonePe / BHIM (Sandbox)",
                },
                {
                  id: "SIMULATED_CARD",
                  title: "Simulated Credit / Debit Card",
                  subtitle: "Visa / MasterCard / RuPay (Sandbox)",
                },
                {
                  id: "SIMULATED_NETBANKING",
                  title: "Simulated NetBanking",
                  subtitle: "HDFC / ICICI / SBI (Sandbox)",
                },
                {
                  id: "SIMULATED_COD",
                  title: "Simulated Pay on Delivery",
                  subtitle: "Cash / UPI at Doorstep (Sandbox)",
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? "border-indigo-600 bg-indigo-50/60"
                      : "border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() =>
                      setPaymentMethod(opt.id as typeof paymentMethod)
                    }
                    className="mt-1 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {opt.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{opt.subtitle}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Order Items & Transaction Summary */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 sticky top-24">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              3. Review Items &amp; Execute Transaction
            </h2>

            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((item) => (
                <div
                  key={item.catalogProductId}
                  className="flex items-center justify-between gap-3 py-2.5 text-xs"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-slate-500">
                      Qty: {item.quantity} × {formatInr(item.priceInr)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900 shrink-0">
                    {formatInr(item.priceInr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({totalItems} units)</span>
                <span className="font-semibold text-slate-900">
                  {formatInr(subtotalInr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span className="font-semibold text-slate-900">
                  {formatInr(taxInr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping</span>
                <span className="font-semibold text-emerald-700">
                  {shippingInr === 0 ? "FREE" : formatInr(shippingInr)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
                <span>Grand Total (INR)</span>
                <span className="text-indigo-600">
                  {formatInr(grandTotalInr)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Executing Checkout Transaction...
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  Confirm &amp; Place Simulated Order ({formatInr(grandTotalInr)})
                </>
              )}
            </button>

            <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 space-y-1">
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                Experiment 5 Transaction Steps:
              </p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-500">
                <li>Validate cart &amp; shipping input via Zod</li>
                <li>Verify product stock in MySQL InventoryItem</li>
                <li>Create Order &amp; OrderItems atomically</li>
                <li>Decrement relational stock &amp; sync MongoDB</li>
              </ol>
            </div>

            <div className="text-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-indigo-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
