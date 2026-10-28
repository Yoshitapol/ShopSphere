import React from "react";
import { CartView } from "@/components/cart/cart-view";
import { Breadcrumb } from "@/components/ui/storefront-helpers";
import { getCurrentUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      <Breadcrumb items={[{ label: "Shopping Cart" }]} />

      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
          Shopping Cart
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Review your selected items and proceed to secure checkout.
        </p>
      </div>

      <CartView user={user} />
    </div>
  );
}
