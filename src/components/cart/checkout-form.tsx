"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
  MapPin,
  ShoppingBag,
  Smartphone,
  Building2,
  Banknote,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { ProductImage } from "@/components/ui/product-image";
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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500 animate-pulse">
        Preparing secure checkout...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card max-w-lg mx-auto my-8 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-extrabold text-ink-900">
          Your Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-500">
          Add products to your cart before proceeding to checkout.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-primary-700"
        >
          Browse Products
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
      {/* Visual 3-Step Checkout Progress Header */}
      <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-4 shadow-card">
        <ol className="grid grid-cols-3 gap-2 sm:gap-4 text-xs">
          <li className="flex items-center gap-2.5 font-bold text-primary-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-extrabold text-white">
              1
            </span>
            <span className="truncate">Delivery Address</span>
          </li>
          <li className="flex items-center gap-2.5 font-bold text-primary-700">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-extrabold text-white">
              2
            </span>
            <span className="truncate">Payment Method</span>
          </li>
          <li className="flex items-center gap-2.5 font-bold text-ink-900">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[11px] font-extrabold text-white">
              3
            </span>
            <span className="truncate">Review &amp; Place Order</span>
          </li>
        </ol>
      </div>

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
          <AlertCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Unable to Complete Order</p>
            <p className="mt-0.5 text-xs sm:text-sm">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Address & Payment Sections */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Delivery Address */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-ink-900">
                  1. Shipping Address
                </h2>
                <p className="text-xs text-slate-500">
                  Where should we deliver your order?
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Recipient Full Name <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.recipientName && (
                  <p className="mt-1 text-xs font-medium text-danger-600">
                    {fieldErrors.recipientName[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Mobile Number <span className="text-danger-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  placeholder="+91 98450 77812"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.recipientPhone && (
                  <p className="mt-1 text-xs font-medium text-danger-600">
                    {fieldErrors.recipientPhone[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Email for Invoice &amp; Tracking Updates{" "}
                  <span className="text-danger-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.recipientEmail && (
                  <p className="mt-1 text-xs font-medium text-danger-600">
                    {fieldErrors.recipientEmail[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Flat / House No., Building, Street &amp; Area{" "}
                  <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.shippingAddress && (
                  <p className="mt-1 text-xs font-medium text-danger-600">
                    {fieldErrors.shippingAddress[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Town / City <span className="text-danger-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.shippingCity && (
                  <p className="mt-1 text-xs font-medium text-danger-600">
                    {fieldErrors.shippingCity[0]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink-800 mb-1.5">
                    State <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-800 mb-1.5">
                    PIN Code <span className="text-danger-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    placeholder="560038"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5 text-sm font-mono text-ink-900 focus:border-primary-500 focus:bg-white"
                  />
                  {fieldErrors.shippingPincode && (
                    <p className="mt-1 text-xs font-medium text-danger-600">
                      {fieldErrors.shippingPincode[0]}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-ink-800 mb-1.5">
                  Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Leave package with building security or call upon arrival"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Payment Method Selection */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-ink-900">
                    2. Payment Method
                  </h2>
                  <p className="text-xs text-slate-500">
                    All transactions are 256-bit encrypted &amp; instant
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-success-50 border border-success-200 px-2.5 py-0.5 text-[11px] font-bold text-success-700">
                Zero Convenience Fee
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  id: "SIMULATED_UPI",
                  title: "UPI Instant Pay",
                  subtitle: "Google Pay, PhonePe, Paytm, BHIM",
                  icon: Smartphone,
                },
                {
                  id: "SIMULATED_CARD",
                  title: "Credit / Debit Card",
                  subtitle: "Visa, MasterCard, RuPay & No-Cost EMI",
                  icon: CreditCard,
                },
                {
                  id: "SIMULATED_NETBANKING",
                  title: "NetBanking",
                  subtitle: "HDFC, ICICI, SBI, Axis & 40+ Banks",
                  icon: Building2,
                },
                {
                  id: "SIMULATED_COD",
                  title: "Pay on Delivery",
                  subtitle: "Cash or UPI QR scan at your doorstep",
                  icon: Banknote,
                },
              ].map((opt) => {
                const IconComp = opt.icon;
                const active = paymentMethod === opt.id;
                return (
                  <label
                    key={opt.id}
                    className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                      active
                        ? "border-primary-600 bg-primary-50/50 ring-2 ring-primary-500/15"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={opt.id}
                      checked={active}
                      onChange={() =>
                        setPaymentMethod(opt.id as typeof paymentMethod)
                      }
                      className="mt-1 text-primary-600 focus:ring-primary-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <IconComp className="h-4 w-4 text-primary-600 shrink-0" />
                        <p className="text-xs font-extrabold text-ink-900">
                          {opt.title}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {opt.subtitle}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Sticky Order Summary with Item Thumbnails */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5">
            <h2 className="text-base font-extrabold text-ink-900 border-b border-slate-100 pb-3">
              3. Order Summary ({totalItems}{" "}
              {totalItems === 1 ? "item" : "items"})
            </h2>

            {/* Item List with Thumbnails */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {items.map((item) => (
                <div
                  key={item.catalogProductId}
                  className="flex items-center justify-between gap-3 py-3 text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-1">
                      <ProductImage
                        src={item.image}
                        alt={item.name}
                        fit="contain"
                        className="h-full w-full"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-ink-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-slate-500">
                        Qty: {item.quantity} × {formatInr(item.priceInr)}
                      </p>
                    </div>
                  </div>
                  <span className="font-extrabold text-ink-900 shrink-0">
                    {formatInr(item.priceInr * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-2.5 border-t border-slate-100 pt-3.5 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Items Subtotal</span>
                <span className="font-semibold text-ink-900">
                  {formatInr(subtotalInr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span className="font-semibold text-ink-900">
                  {formatInr(taxInr)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Express Shipping</span>
                <span className="font-bold text-success-700">
                  {shippingInr === 0 ? "FREE" : formatInr(shippingInr)}
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-ink-900">
                <span>Order Total</span>
                <span className="text-lg text-ink-900">
                  {formatInr(grandTotalInr)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-accent-600 active:scale-[0.99] disabled:opacity-60 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Placing Your Order...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Place Order &amp; Pay {formatInr(grandTotalInr)}</span>
                </>
              )}
            </button>

            <div className="rounded-xl bg-slate-50 p-3.5 text-[11px] text-slate-600 space-y-1.5">
              <p className="font-bold text-ink-800 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-success-600 shrink-0" />
                ShopSphere Buyer Protection
              </p>
              <p className="text-slate-500 leading-relaxed">
                Instant order confirmation, live inventory reservation, and
                7-day doorstep replacement if your item arrives damaged.
              </p>
            </div>

            <div className="text-center">
              <Link
                href="/cart"
                className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-primary-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Return to Shopping Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
