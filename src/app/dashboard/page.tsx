// ============================================================================
// ShopSphere Admin Dashboard Overview Page (/dashboard)
// Experiment 2: Analytics Cards, Responsive Tables & Category Breakdown
// Experiment 8: Protected Admin Route
// Experiment 10: Sanitized Environment Variable Security Audit Table
// ============================================================================
import React from "react";
import Link from "next/link";
import {
  IndianRupee,
  ShoppingBag,
  Package,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CategoryManager } from "@/components/dashboard/category-manager";
import { getDashboardAnalytics } from "@/lib/prisma/order-service";
import { listCategories } from "@/lib/mongodb/product-service";
import { requireAdminUser } from "@/lib/permissions/rbac";
import { getSanitizedEnvAudit } from "@/lib/env";
import { formatDateTime, formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverviewPage() {
  await requireAdminUser("/dashboard");
  const [analytics, categories] = await Promise.all([
    getDashboardAnalytics(),
    listCategories(),
  ]);
  const envAudit = getSanitizedEnvAudit();

  return (
    <div className="space-y-8">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Experiment 2, 5, 6 &amp; 8: Administrative Control Center
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Platform Analytics &amp; Operations
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Manage Inventory ({analytics.totalProducts})
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Revenue (INR)
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {formatInr(analytics.totalRevenueInr)}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Across non-cancelled simulated orders
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {analytics.totalOrders}
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
          >
            Update order statuses <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Catalog Products
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {analytics.totalProducts}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            In {analytics.totalCategories} relational categories
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Low / Out of Stock
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-slate-900">
            {analytics.lowStockCount} Low / {analytics.outOfStockCount} Empty
          </p>
          <Link
            href="/dashboard/products"
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline"
          >
            Review reorder thresholds <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Category Management & Demo Reset Widget */}
      <CategoryManager categories={categories} />

      {/* Recent Orders & Category Stock Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Recent Transactional Orders
              </h3>
              <p className="text-xs text-slate-500">
                Latest orders persisted by the checkout pipeline.
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Manage All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Total (INR)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {analytics.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono font-bold text-indigo-600">
                      <Link href={`/orders/${order.id}`} className="hover:underline">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">
                        {order.recipientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.recipientEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-900">
                      {formatInr(order.totalInr)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Stock Summary */}
        <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Warehouse Stock by Category
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated from MySQL InventoryItem records.
            </p>
          </div>

          <div className="space-y-3">
            {analytics.categoryBreakdown.map((item) => (
              <div
                key={item.categoryName}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{item.categoryName}</p>
                  <p className="text-slate-500">{item.productCount} SKUs</p>
                </div>
                <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 font-extrabold text-indigo-700">
                  {item.totalStock} units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Experiment 10: Sanitized Environment Variable Security Audit */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-indigo-600" />
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Experiment 10: Environment Variable Security Audit (Redacted)
            </h3>
            <p className="text-xs text-slate-500">
              Private credentials are isolated in <code className="font-mono">server-only</code>{" "}
              modules and redacted below. Only{" "}
              <code className="font-mono">NEXT_PUBLIC_*</code> variables reach
              the browser bundle.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Variable</th>
                <th className="px-4 py-3 text-left">Security Scope</th>
                <th className="px-4 py-3 text-left">Redacted Preview</th>
                <th className="px-4 py-3 text-left">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {envAudit.map((row) => (
                <tr key={row.variable}>
                  <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                    {row.variable}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        row.scope.includes("Server-Only")
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {row.scope}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-slate-500 max-w-xs truncate">
                    {row.maskedPreview}
                  </td>
                  <td className="px-4 py-2.5 text-slate-600">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
