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
  TrendingUp,
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
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Store Performance &amp; Operations
          </span>
          <h2 className="text-2xl font-extrabold text-ink-900 mt-0.5">
            Executive Overview
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-800 shadow-xs hover:bg-slate-50 transition"
          >
            Manage Inventory ({analytics.totalProducts})
          </Link>
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Product
          </Link>
        </div>
      </div>

      {/* 4 Analytics Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Gross Revenue
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
              <IndianRupee className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink-900">
            {formatInr(analytics.totalRevenueInr)}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-success-700">
            <TrendingUp className="h-3.5 w-3.5" />
            Active storefront revenue
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Orders
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success-50 text-success-600">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink-900">
            {analytics.totalOrders}
          </p>
          <Link
            href="/dashboard/orders"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-primary-600 hover:underline"
          >
            Manage order fulfillment <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Active SKUs
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink-900">
            {analytics.totalProducts}
          </p>
          <p className="mt-1.5 text-xs text-slate-500">
            Across {analytics.totalCategories} store departments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stock Alerts
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning-50 text-warning-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-extrabold text-ink-900">
            {analytics.lowStockCount} Low · {analytics.outOfStockCount} Out
          </p>
          <Link
            href="/dashboard/products"
            className="mt-1.5 inline-flex items-center gap-1 text-xs font-bold text-warning-700 hover:underline"
          >
            Review reorder levels <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Category Management & Catalog Reset */}
      <CategoryManager categories={categories} />

      {/* Recent Orders & Department Stock Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Recent Orders Table */}
        <div className="lg:col-span-8 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-ink-900">
                Recent Customer Orders
              </h3>
              <p className="text-xs text-slate-500">
                Latest orders placed on ShopSphere
              </p>
            </div>
            <Link
              href="/dashboard/orders"
              className="text-xs font-bold text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
            >
              View All Orders <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Order #</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {analytics.recentOrders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className={`${
                      idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                    } hover:bg-primary-50/30 transition-colors`}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-primary-600">
                      <Link
                        href={`/orders/${order.id}`}
                        className="hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-ink-900">
                        {order.recipientName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {order.recipientEmail}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(order.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-extrabold text-ink-900">
                      {formatInr(order.totalInr)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="rounded-full bg-primary-50 border border-primary-200 px-2.5 py-0.5 text-[11px] font-bold text-primary-700">
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
        <div className="lg:col-span-4 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-ink-900">
              Inventory by Department
            </h3>
            <p className="text-xs text-slate-500">
              Available units across fulfillment centers
            </p>
          </div>

          <div className="space-y-3">
            {analytics.categoryBreakdown.map((item) => (
              <div
                key={item.categoryName}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs"
              >
                <div>
                  <p className="font-bold text-ink-900">{item.categoryName}</p>
                  <p className="text-slate-500">{item.productCount} SKUs</p>
                </div>
                <span className="rounded-lg bg-white border border-slate-200 px-2.5 py-1 font-extrabold text-primary-700 shadow-2xs">
                  {item.totalStock} units
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Security Configuration Audit */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="h-5 w-5 text-primary-600" />
          <div>
            <h3 className="text-base font-extrabold text-ink-900">
              Security &amp; Environment Configuration Audit
            </h3>
            <p className="text-xs text-slate-500">
              Server credentials are isolated on the backend and redacted below.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Key</th>
                <th className="px-4 py-3 text-left">Visibility Scope</th>
                <th className="px-4 py-3 text-left">Redacted Value</th>
                <th className="px-4 py-3 text-left">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {envAudit.map((row, idx) => (
                <tr
                  key={row.variable}
                  className={idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"}
                >
                  <td className="px-4 py-2.5 font-mono font-bold text-ink-900">
                    {row.variable}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        row.scope.includes("Server-Only")
                          ? "bg-danger-50 text-danger-700 border border-danger-200"
                          : "bg-success-50 text-success-700 border border-success-200"
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
