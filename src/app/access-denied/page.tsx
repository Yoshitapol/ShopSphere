// ============================================================================
// ShopSphere Role-Based Access Control (RBAC) Access Denied Page (/access-denied)
// Experiment 8: Server-Boundary Authorization Enforcement
// ============================================================================
import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Lock, UserCheck } from "lucide-react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { getCurrentUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

interface AccessDeniedPageProps {
  searchParams: Promise<{ reason?: string; orderId?: string }>;
}

export default async function AccessDeniedPage({
  searchParams,
}: AccessDeniedPageProps) {
  const { reason, orderId } = await searchParams;
  const user = await getCurrentUser();

  const isOrderOwnershipViolation = reason === "order-ownership";

  return (
    <StorefrontLayout>
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-rose-200 bg-white p-8 text-center shadow-sm space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-800">
              <Lock className="h-3.5 w-3.5" />
              HTTP 403 • Access Denied (Experiment 8 RBAC)
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {isOrderOwnershipViolation
                ? "Unauthorized Order Access Blocked"
                : "Administrator Privileges Required"}
            </h1>

            <p className="text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
              {isOrderOwnershipViolation ? (
                <>
                  Server-boundary ownership check prevented access to order{" "}
                  <code className="font-mono font-bold text-rose-700">
                    {orderId || "requested"}
                  </code>
                  . As a Customer, you can only view orders belonging to your
                  own authenticated account.
                </>
              ) : (
                <>
                  You attempted to access a protected administrative route (
                  <code className="font-mono text-rose-700">/dashboard</code>),
                  which requires the{" "}
                  <strong className="text-slate-900">ADMIN</strong> role on the
                  server boundary.
                </>
              )}
            </p>
          </div>

          {/* Current Session Diagnostics */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-1.5">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-indigo-600" />
              Your Active Session Context:
            </p>
            <p className="text-slate-600">
              User:{" "}
              <strong className="text-slate-900">
                {user ? `${user.name} (${user.email})` : "Unauthenticated Guest"}
              </strong>
            </p>
            <p className="text-slate-600">
              Verified Server Role:{" "}
              <span className="rounded bg-slate-200 px-1.5 py-0.5 font-mono font-bold text-slate-900">
                {user?.role ?? "GUEST"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Return to Homepage
            </Link>
            {isOrderOwnershipViolation && (
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800 transition"
              >
                Back to My Orders
              </Link>
            )}
            <Link
              href="/login?callbackUrl=/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
            >
              Switch to Admin Account
            </Link>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
