// ============================================================================
// ShopSphere Protected Checkout Page (/checkout)
// Experiment 5: Transactional Checkout Pipeline
// Experiment 8: Server-Boundary Customer/Admin Authentication Check
// ============================================================================
import React from "react";
import { CheckoutForm } from "@/components/cart/checkout-form";
import { requireAuthenticatedUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const user = await requireAuthenticatedUser("/checkout");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Experiment 5: MySQL ACID Transaction
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
          Simulated Checkout &amp; Stock Reservation
        </h1>
      </div>

      <CheckoutForm user={user} />
    </div>
  );
}
