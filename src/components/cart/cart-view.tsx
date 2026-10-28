"use client";

import React from "react";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Truck,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { ProductImage } from "@/components/ui/product-image";
import { formatInr } from "@/lib/utils/format";
import type { AppUser } from "@/types";

interface CartViewProps {
  user: AppUser | null;
}

const FREE_SHIPPING_THRESHOLD = 2000;

export function CartView({ user }: CartViewProps) {
  const {
    items,
    isHydrated,
    totalItems,
    subtotalInr,
    taxInr,
    shippingInr,
    grandTotalInr,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { showToast } = useToast();

  if (!isHydrated) {
    return (
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 animate-pulse">
        <div className="lg:col-span-8 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-slate-200 bg-white p-4"
            />
          ))}
        </div>
        <div className="lg:col-span-4 h-72 rounded-2xl border border-slate-200 bg-white p-6" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200/90 bg-white p-12 text-center shadow-card max-w-lg mx-auto my-8 space-y-5">
        <div className="mx-auto relative flex h-20 w-20 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <ShoppingBag className="h-9 w-9" />
          <Sparkles className="h-4 w-4 text-accent-500 absolute top-2 right-2" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-extrabold text-ink-900">
            Your Shopping Cart is Empty
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            Looks like you haven&apos;t added anything to your cart yet. Explore
            top deals on headphones, laptops, smartwatches, and home essentials.
          </p>
        </div>
        <div className="pt-1">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-700 transition"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const amountRemainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotalInr
  );
  const freeShippingProgressPct = Math.min(
    100,
    Math.round((subtotalInr / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
      {/* Left: Cart Items List */}
      <div className="lg:col-span-8 space-y-4">
        {/* Free Shipping Progress Bar Banner */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-2 font-bold text-ink-900">
              <Truck className="h-4 w-4 text-primary-600 shrink-0" />
              {amountRemainingForFreeShipping === 0 ? (
                <span className="text-success-700">
                  Yay! Your order qualifies for FREE Express Delivery!
                </span>
              ) : (
                <span>
                  Add{" "}
                  <strong className="text-primary-600">
                    {formatInr(amountRemainingForFreeShipping)}
                  </strong>{" "}
                  more to unlock{" "}
                  <strong className="text-success-700">FREE delivery</strong>
                </span>
              )}
            </span>
            <span className="font-bold text-slate-400">
              {freeShippingProgressPct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                amountRemainingForFreeShipping === 0
                  ? "bg-success-600"
                  : "bg-primary-600"
              }`}
              style={{ width: `${freeShippingProgressPct}%` }}
            />
          </div>
        </div>

        {/* Items Header */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500">
            Bag ({totalItems} {totalItems === 1 ? "item" : "items"})
          </h2>
          <button
            type="button"
            onClick={() => {
              clearCart();
              showToast("Cleared all items from your cart", "info");
            }}
            className="text-xs font-bold text-danger-600 hover:text-danger-700"
          >
            Empty Cart
          </button>
        </div>

        {/* Item Cards */}
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.catalogProductId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-card hover:border-slate-300 transition"
            >
              <div className="flex items-center gap-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center justify-center"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    fit="contain"
                    className="h-full w-full"
                  />
                </Link>

                <div className="space-y-1 min-w-0">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-primary-600">
                    {item.categoryName}
                  </span>
                  <Link
                    href={`/products/${item.slug}`}
                    className="block text-sm sm:text-base font-bold text-ink-900 hover:text-primary-600 transition line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500">
                    Unit Price:{" "}
                    <strong className="text-ink-800">
                      {formatInr(item.priceInr)}
                    </strong>
                  </p>
                  <p className="text-[11px] font-medium text-success-700">
                    In stock • Eligible for 7-day replacement
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0 shrink-0">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.catalogProductId, item.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-700 shadow-xs hover:bg-slate-100 transition"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-xs font-extrabold text-ink-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.quantity >= item.maxStock) {
                        showToast(
                          `Only ${item.maxStock} units available`,
                          "info"
                        );
                        return;
                      }
                      updateQuantity(item.catalogProductId, item.quantity + 1);
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-700 shadow-xs hover:bg-slate-100 transition"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Line Subtotal */}
                <div className="text-right min-w-[95px]">
                  <p className="text-base font-extrabold text-ink-900">
                    {formatInr(item.priceInr * item.quantity)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} × {formatInr(item.priceInr)}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.catalogProductId);
                    showToast(`Removed "${item.name}" from cart`, "info");
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-danger-50 hover:text-danger-600 transition"
                  aria-label={`Remove ${item.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Right: Sticky Order Summary Card */}
      <div className="lg:col-span-4 lg:sticky lg:top-28">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5">
          <h2 className="text-base font-extrabold text-ink-900 border-b border-slate-100 pb-3">
            Price Details ({totalItems} {totalItems === 1 ? "item" : "items"})
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-semibold text-ink-900">
                {formatInr(subtotalInr)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated GST (18%)</span>
              <span className="font-semibold text-ink-900">
                {formatInr(taxInr)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Delivery Charges</span>
              <span className="font-bold text-success-700">
                {shippingInr === 0 ? "FREE" : formatInr(shippingInr)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3.5 text-base font-extrabold text-ink-900">
              <span>Total Amount</span>
              <span className="text-lg text-ink-900">
                {formatInr(grandTotalInr)}
              </span>
            </div>
          </div>

          {user ? (
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-accent-600 active:scale-[0.99] transition"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/login?callbackUrl=/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-sm hover:bg-primary-700 transition"
              >
                <span>Sign In to Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-center text-slate-500">
                Have an account or want to try a demo profile? Use the{" "}
                <strong className="text-ink-800">Demo</strong> switcher in the
                top bar.
              </p>
            </div>
          )}

          <div className="space-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-success-600 shrink-0" />
              <span>Safe and secure payments. 100% authentic products.</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-primary-600 shrink-0" />
              <span>Easy 7-day replacement if damaged or defective.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
