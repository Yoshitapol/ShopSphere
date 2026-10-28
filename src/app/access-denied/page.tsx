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
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-card-hover space-y-5">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-danger-50 text-danger-600 border border-danger-200">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-danger-50 border border-danger-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-danger-700">
              <Lock className="h-3.5 w-3.5" />
              Restricted Access
            </span>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
              {isOrderOwnershipViolation
                ? "This Order Belongs to Another Account"
                : "Store Administrator Access Required"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              {isOrderOwnershipViolation ? (
                <>
                  For your privacy and security, order{" "}
                  <strong className="font-mono text-ink-800">
                    {orderId || "requested"}
                  </strong>{" "}
                  can only be viewed by the customer who placed it.
                </>
              ) : (
                <>
                  The Seller Central &amp; Inventory console is restricted to
                  authorized store administrators.
                </>
              )}
            </p>
          </div>

          {/* Current Account Summary */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-1">
            <p className="font-bold text-ink-900 flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-primary-600" />
              Signed-in Account
            </p>
            <p className="text-slate-600">
              {user
                ? `${user.name} (${user.email}) — ${user.role}`
                : "Browsing as Guest"}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-800 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Store
            </Link>
            {isOrderOwnershipViolation && (
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 rounded-xl bg-ink-900 px-4 py-2.5 text-xs font-bold text-white hover:bg-ink-800 transition"
              >
                View My Orders
              </Link>
            )}
            <Link
              href="/login?callbackUrl=/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  );
}
