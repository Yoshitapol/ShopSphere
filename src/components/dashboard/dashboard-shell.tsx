"use client";

// ============================================================================
// ShopSphere Admin Dashboard Shell (Sidebar + Topbar + State Preservation Widget)
// Experiment 2: Responsive Dashboard Sidebar & Topbar
// Experiment 3: Shared Nested Layout Navigation Using next/link
// ============================================================================
import React, { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ClipboardList,
  ShoppingBag,
  ArrowLeft,
  ShieldCheck,
  Database,
  Menu,
  X,
} from "lucide-react";
import { DashboardStatePreservationWidget } from "@/components/dashboard/state-preservation-widget";
import type { AppUser, DatabaseHealthStatus } from "@/types";

interface DashboardShellProps {
  user: AppUser;
  health: DatabaseHealthStatus;
  children: ReactNode;
}

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Overview & Analytics",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/dashboard/products",
    label: "Products & Inventory",
    icon: Package,
    exact: false,
  },
  {
    href: "/dashboard/products/new",
    label: "Add New Product",
    icon: PlusCircle,
    exact: true,
  },
  {
    href: "/dashboard/orders",
    label: "Order Management",
    icon: ClipboardList,
    exact: false,
  },
];

export function DashboardShell({
  user,
  health,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLinkActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    if (href === "/dashboard/products" && pathname === "/dashboard/products/new") {
      return false;
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition-transform duration-200 lg:static lg:translate-x-0 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900">
                  Shop<span className="text-indigo-600">Sphere</span>
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Admin Console
                </span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Primary Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Operations
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Experiment 3: Persistent Layout State Widget */}
          <DashboardStatePreservationWidget />
        </div>

        {/* Bottom Storefront Link & Admin Profile */}
        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user.name}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
            </div>
            <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800">
              ADMIN
            </span>
          </div>

          <Link
            href="/"
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Return to Public Storefront
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
              aria-label="Open dashboard menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                Inventory &amp; Marketplace Operations
              </h1>
              <p className="text-xs text-slate-500 hidden sm:block">
                Server-Boundary RBAC Protected • MySQL (Prisma) + MongoDB (Mongoose)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className={`hidden md:inline-flex items-center gap-1.5 rounded-xl border px-3 py-1 text-xs font-semibold ${
                health.mode === "hybrid-live"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <Database className="h-3.5 w-3.5" />
              {health.mode === "hybrid-live"
                ? "Live Hybrid DBs Connected"
                : "Persistent Disk Store Active"}
            </span>

            <span className="inline-flex items-center gap-1 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Role: {user.role}
            </span>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
