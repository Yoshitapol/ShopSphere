"use client";

// ============================================================================
// ShopSphere Responsive Navigation Bar
// Experiment 1: Client Component Navigation with next/link
// Experiment 2: Mobile-First Responsive Navbar with Search & Cart Badge
// Experiment 7 & 8: Authenticated State, Role Badge & Lab Practical Role Switcher
// ============================================================================
import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  UserCheck,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Package,
  ClipboardList,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import {
  signOutAction,
  switchDemoPersonaAction,
} from "@/actions/auth-actions";
import type { AppUser } from "@/types";

interface NavbarProps {
  user: AppUser | null;
  enableDevSwitcher?: boolean;
}

export function Navbar({ user, enableDevSwitcher = true }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, isHydrated } = useCart();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setMobileMenuOpen(false);
    if (q) {
      router.push(`/products?search=${encodeURIComponent(q)}`);
    } else {
      router.push("/products");
    }
  };

  const handlePersonaSwitch = (
    persona:
      | "GUEST"
      | "admin@shopsphere.in"
      | "priya.nair@shopsphere.in"
      | "rohan.deshmukh@shopsphere.in",
    label: string
  ) => {
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    startTransition(async () => {
      const res = await switchDemoPersonaAction(persona);
      if (res.ok) {
        showToast(`Switched active session to ${label}`, "info");
        router.refresh();
      } else {
        showToast(res.error || "Could not switch persona", "error");
      }
    });
  };

  const handleSignOut = () => {
    setRoleMenuOpen(false);
    setMobileMenuOpen(false);
    startTransition(async () => {
      await signOutAction();
      showToast("Signed out successfully. Browsing as Guest.", "info");
      router.push("/");
      router.refresh();
    });
  };

  const roleBadgeColor =
    user?.role === "ADMIN"
      ? "bg-indigo-100 text-indigo-800 border-indigo-200"
      : user?.role === "CUSTOMER"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : "bg-slate-100 text-slate-700 border-slate-200";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left: Brand + Primary Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-slate-900 hover:opacity-90 transition"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <ShoppingBag className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight leading-none">
                Shop<span className="text-indigo-600">Sphere</span>
              </span>
              <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-0.5">
                Hybrid Storefront
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === "/"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Home
            </Link>
            <Link
              href="/products"
              className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname.startsWith("/products")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              Catalog
            </Link>
            {user && (
              <Link
                href="/orders"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  pathname.startsWith("/orders")
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                My Orders
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  pathname.startsWith("/dashboard")
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Center: Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden lg:flex flex-1 max-w-sm items-center relative"
        >
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headphones, laptops, SKUs..."
            aria-label="Search products"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        {/* Right: Cart + Auth / Role Switcher */}
        <div className="flex items-center gap-2.5">
          {/* Shopping Cart Link */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-indigo-300 hover:bg-slate-50 transition"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-4 w-4 text-indigo-600" />
            <span className="hidden sm:inline">Cart</span>
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white">
              {isHydrated ? totalItems : 0}
            </span>
          </Link>

          {/* Role / Auth Menu Dropdown */}
          <div className="relative">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setRoleMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-50 transition"
            >
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-bold uppercase ${roleBadgeColor}`}
              >
                {user?.role === "ADMIN" ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <UserCheck className="h-3 w-3" />
                )}
                {user?.role ?? "GUEST"}
              </span>
              <span className="hidden sm:inline max-w-[120px] truncate text-xs font-semibold text-slate-700">
                {user ? user.name.split(" ")[0] : "Sign In"}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setRoleMenuOpen(false)}
                />
                <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
                  {user ? (
                    <div className="border-b border-slate-100 pb-2.5 mb-2.5">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Signed-In Session
                      </p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email}
                      </p>
                    </div>
                  ) : (
                    <div className="border-b border-slate-100 pb-2.5 mb-2.5">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Current Role: Guest
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Browse catalog freely or sign in to place orders.
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col gap-1">
                    {!user ? (
                      <Link
                        href="/login"
                        onClick={() => setRoleMenuOpen(false)}
                        className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                      >
                        Go to Sign In / OAuth Page
                      </Link>
                    ) : (
                      <>
                        <Link
                          href="/orders"
                          onClick={() => setRoleMenuOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          <ClipboardList className="h-3.5 w-3.5 text-slate-500" />
                          My Order History
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link
                            href="/dashboard"
                            onClick={() => setRoleMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5 text-indigo-600" />
                            Admin Control Center
                          </Link>
                        )}
                      </>
                    )}
                  </div>

                  {enableDevSwitcher && (
                    <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-1.5">
                        <Sparkles className="h-3 w-3" />
                        Viva / Lab Role Switcher (Exp 7 & 8)
                      </div>
                      <div className="grid grid-cols-1 gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch("GUEST", "Guest (Unauthenticated)")
                          }
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            !user
                              ? "bg-slate-100 font-semibold text-slate-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>1. Guest (Public Only)</span>
                          <span className="text-[10px] rounded bg-slate-200 px-1.5 py-0.5">
                            GUEST
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch(
                              "priya.nair@shopsphere.in",
                              "Priya Nair (Customer)"
                            )
                          }
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            user?.email === "priya.nair@shopsphere.in"
                              ? "bg-emerald-50 font-semibold text-emerald-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>2. Priya Nair (Customer #1)</span>
                          <span className="text-[10px] rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5">
                            CUSTOMER
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch(
                              "rohan.deshmukh@shopsphere.in",
                              "Rohan Deshmukh (Customer)"
                            )
                          }
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            user?.email === "rohan.deshmukh@shopsphere.in"
                              ? "bg-emerald-50 font-semibold text-emerald-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>3. Rohan Deshmukh (Customer #2)</span>
                          <span className="text-[10px] rounded bg-emerald-100 text-emerald-800 px-1.5 py-0.5">
                            CUSTOMER
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch(
                              "admin@shopsphere.in",
                              "Aarav Mehta (Admin)"
                            )
                          }
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                            user?.role === "ADMIN"
                              ? "bg-indigo-50 font-semibold text-indigo-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>4. Aarav Mehta (Full Admin)</span>
                          <span className="text-[10px] rounded bg-indigo-100 text-indigo-800 px-1.5 py-0.5">
                            ADMIN
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {user && (
                    <div className="mt-2.5 border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        Sign Out Session
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-sm text-slate-900"
            />
          </form>

          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              Home
            </Link>
            <Link
              href="/products"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <Package className="h-4 w-4 text-indigo-600" />
              All Products
            </Link>
            {user && (
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <ClipboardList className="h-4 w-4 text-indigo-600" />
                My Orders
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin Dashboard
              </Link>
            )}
            {!user && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white mt-2"
              >
                Sign In / OAuth
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
