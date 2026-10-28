"use client";

// ============================================================================
// ShopSphere Shopping Cart Interactive Client View
// Experiment 2 & 14: Shopping Cart Interface, Quantity Controls & Summary
// ============================================================================
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
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import { ProductImage } from "@/components/ui/product-image";
import { formatInr } from "@/lib/utils/format";
import type { AppUser } from "@/types";

interface CartViewProps {
  user: AppUser | null;
}

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
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
        Loading your shopping cart...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-8 space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <ShoppingBag className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Your Shopping Cart is Empty
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Browse our catalog of wireless ANC headphones, mechanical keyboards,
          developer laptops, and smart wearables to add items to your cart.
        </p>
        <div className="pt-2">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            Browse Product Catalog
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      {/* Left: Cart Items List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            Cart Items ({totalItems} {totalItems === 1 ? "unit" : "units"})
          </h2>
          <button
            type="button"
            onClick={() => {
              clearCart();
              showToast("Cleared all items from cart", "info");
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear Cart
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.catalogProductId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <Link
                  href={`/products/${item.slug}`}
                  className="h-20 w-24 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
                >
                  <ProductImage
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full"
                  />
                </Link>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-indigo-600">
                    {item.categoryName}
                  </span>
                  <Link
                    href={`/products/${item.slug}`}
                    className="block text-sm font-bold text-slate-900 hover:text-indigo-600 transition"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-slate-500 font-mono">
                    SKU: {item.sku} • Unit Price: {formatInr(item.priceInr)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 border-slate-100 pt-3 sm:pt-0">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.catalogProductId, item.quantity - 1)
                    }
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-l-xl"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-9 text-center text-xs font-bold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (item.quantity >= item.maxStock) {
                        showToast(
                          `Only ${item.maxStock} units available in warehouse`,
                          "info"
                        );
                        return;
                      }
                      updateQuantity(item.catalogProductId, item.quantity + 1);
                    }}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-r-xl"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Line Subtotal */}
                <div className="text-right min-w-[90px]">
                  <p className="text-sm font-extrabold text-slate-900">
                    {formatInr(item.priceInr * item.quantity)}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Max stock: {item.maxStock}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    removeItem(item.catalogProductId);
                    showToast(`Removed "${item.name}" from cart`, "info");
                  }}
                  className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
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
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Continue Shopping
          </Link>
        </div>
      </div>

      {/* Right: Order Summary Card */}
      <div className="lg:col-span-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 sticky top-24">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Order Summary (₹ INR)
          </h2>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center justify-between text-slate-600">
              <span>Items Subtotal ({totalItems})</span>
              <span className="font-semibold text-slate-900">
                {formatInr(subtotalInr)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Estimated GST (18%)</span>
              <span className="font-semibold text-slate-900">
                {formatInr(taxInr)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Express Delivery</span>
              <span className="font-semibold text-emerald-700">
                {shippingInr === 0 ? "FREE" : formatInr(shippingInr)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-slate-900">
              <span>Total Payable</span>
              <span className="text-indigo-600">{formatInr(grandTotalInr)}</span>
            </div>
          </div>

          {user ? (
            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <div className="space-y-2.5">
              <Link
                href="/login?callbackUrl=/checkout"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
              >
                Sign In to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="text-[11px] text-center text-slate-500">
                Tip: You can also use the{" "}
                <strong className="text-slate-700">Role Switcher</strong> in the
                top navbar to switch to a Customer persona immediately.
              </p>
            </div>
          )}

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
            <span>
              Prices and relational warehouse stock are re-verified on the
              server inside a MySQL transaction during checkout.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
