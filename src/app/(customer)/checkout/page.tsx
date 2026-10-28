import React from "react";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { Breadcrumb } from "@/components/ui/storefront-helpers";
import { requireAuthenticatedUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireAuthenticatedUser("/checkout");

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Breadcrumb
        items={[
          { label: "Shopping Cart", href: "/cart" },
          { label: "Secure Checkout" },
        ]}
      />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
          Secure Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Complete your delivery details and choose a payment method to place your order.
        </p>
      </div>

      <CheckoutForm user={user} />
    </div>
  );
}
