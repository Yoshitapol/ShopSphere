// ============================================================================
// ShopSphere Shopping Cart Page (/cart)
// Experiment 1 & 2: Server Component Wrapper + Client Cart View
// ============================================================================
import React from "react";
import { CartView } from "@/components/cart/cart-view";
import { getCurrentUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Customer Shopping Bag
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Your Shopping Cart
        </h1>
      </div>

      <CartView user={user} />
    </div>
  );
}
