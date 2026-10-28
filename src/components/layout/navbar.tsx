"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  ShoppingCart,
  Search,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Package,
  ClipboardList,
  ChevronDown,
  Truck,
  RotateCcw,
  ShieldCheck,
  MapPin,
  SlidersHorizontal,
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

const DEPARTMENT_LINKS = [
  { label: "All Categories", slug: "all", href: "/products" },
  {
    label: "Audio & Headphones",
    slug: "audio-headphones",
    href: "/products?category=audio-headphones",
  },
  {
    label: "Laptops & Computing",
    slug: "laptops-computing",
    href: "/products?category=laptops-computing",
  },
  {
    label: "Smart Wearables",
    slug: "smart-wearables",
    href: "/products?category=smart-wearables",
  },
  {
    label: "Ergonomic Workspace",
    slug: "ergonomic-workspace",
    href: "/products?category=ergonomic-workspace",
  },
  {
    label: "Smart Home & Coffee",
    slug: "smart-home-coffee",
    href: "/products?category=smart-home-coffee",
  },
];

export function Navbar({ user, enableDevSwitcher = true }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems, isHydrated } = useCart();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    setMobileMenuOpen(false);
    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (selectedCategory && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }
    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
  };

  const handlePersonaSwitch = (
    persona:
      | "GUEST"
      | "admin@shopsphere.in"
      | "priya.nair@shopsphere.in"
      | "rohan.deshmukh@shopsphere.in",
    label: string
  ) => {
    setAccountMenuOpen(false);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    startTransition(async () => {
      const res = await switchDemoPersonaAction(persona);
      if (res.ok) {
        showToast(`Switched active account to ${label}`, "info");
        router.refresh();
      } else {
        showToast(res.error || "Could not switch account", "error");
      }
    });
  };

  const handleSignOut = () => {
    setAccountMenuOpen(false);
    setDemoMenuOpen(false);
    setMobileMenuOpen(false);
    startTransition(async () => {
      await signOutAction();
      showToast("Signed out of your account.", "info");
      router.push("/");
      router.refresh();
    });
  };

  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "G";

  return (
    <header className="sticky top-0 z-40 w-full shadow-header">
      {/* Tier 1: Top Utility Bar */}
      <div className="bg-ink-950 text-slate-300 border-b border-white/10 text-[11px]">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 overflow-x-auto whitespace-nowrap">
            <span className="inline-flex items-center gap-1.5 font-medium text-white">
              <Truck className="h-3.5 w-3.5 text-accent-400 shrink-0" />
              Free express delivery on orders above ₹2,000
            </span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span className="hidden sm:inline-flex items-center gap-1.5">
              <RotateCcw className="h-3 w-3 text-primary-400 shrink-0" />
              Easy 7-day replacement
            </span>
            <span className="hidden md:inline text-slate-600">•</span>
            <span className="hidden md:inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              100% Genuine Brand Warranty
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="hidden lg:inline-flex items-center gap-1 text-slate-400">
              <MapPin className="h-3 w-3 text-accent-400" />
              Delivering across India
            </span>

            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1 rounded-md bg-primary-600/30 border border-primary-400/40 px-2 py-0.5 text-[11px] font-semibold text-primary-200 hover:bg-primary-600/50 transition"
              >
                <LayoutDashboard className="h-3 w-3" />
                Seller Central
              </Link>
            )}

            {/* Tucked-away Demo Switcher Pill */}
            {enableDevSwitcher && (
              <div className="relative">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setDemoMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1 rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
                  aria-label="Switch demo account"
                >
                  <SlidersHorizontal className="h-3 w-3 text-accent-400" />
                  <span>Demo</span>
                  <ChevronDown className="h-3 w-3 opacity-70" />
                </button>

                {demoMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setDemoMenuOpen(false)}
                    />
                    <div className="absolute right-0 z-20 mt-1.5 w-64 rounded-xl border border-slate-200 bg-white p-2.5 text-ink-900 shadow-card-hover">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1.5 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          Quick Account Switcher
                        </span>
                        <span className="rounded bg-primary-50 px-1.5 py-0.5 text-[10px] font-bold text-primary-700">
                          {user?.role ?? "GUEST"}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs">
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch("GUEST", "Guest Visitor")
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                            !user
                              ? "bg-slate-100 font-bold text-ink-900"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>Guest Shopper</span>
                          <span className="text-[10px] rounded bg-slate-200 px-1.5 py-0.5 font-semibold">
                            GUEST
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch(
                              "priya.nair@shopsphere.in",
                              "Priya Nair"
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                            user?.email === "priya.nair@shopsphere.in"
                              ? "bg-success-50 font-bold text-success-800"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>Priya Nair (Customer)</span>
                          <span className="text-[10px] rounded bg-success-100 text-success-800 px-1.5 py-0.5 font-semibold">
                            CUSTOMER
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handlePersonaSwitch(
                              "rohan.deshmukh@shopsphere.in",
                              "Rohan Deshmukh"
                            )
                          }
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                            user?.email === "rohan.deshmukh@shopsphere.in"
                              ? "bg-success-50 font-bold text-success-800"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>Rohan Deshmukh (Customer)</span>
                          <span className="text-[10px] rounded bg-success-100 text-success-800 px-1.5 py-0.5 font-semibold">
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
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left transition ${
                            user?.role === "ADMIN"
                              ? "bg-primary-50 font-bold text-primary-800"
                              : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>Aarav Mehta (Store Admin)</span>
                          <span className="text-[10px] rounded bg-primary-100 text-primary-800 px-1.5 py-0.5 font-semibold">
                            ADMIN
                          </span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tier 2: Main Store Header */}
      <div className="bg-ink-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 sm:gap-6 px-4 sm:px-6 lg:px-8">
          {/* Left: Mobile Menu Button + Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="inline-flex md:hidden items-center justify-center rounded-lg p-2 text-slate-200 hover:bg-white/10 transition"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            <Link
              href="/"
              className="flex items-center gap-2.5 group focus-visible:ring-accent-400"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-sm group-hover:scale-105 transition-transform">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white leading-none">
                    Shop<span className="text-accent-400">Sphere</span>
                  </span>
                  <span className="text-[10px] font-bold text-primary-300">
                    .in
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 leading-none mt-0.5 hidden sm:block">
                  Electronics &amp; Lifestyle
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Wide Prominent Search Bar with Category Dropdown (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl items-center"
          >
            <div className="flex w-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-white/10 focus-within:ring-2 focus-within:ring-accent-400">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter search by category"
                className="hidden lg:block border-r border-slate-200 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-ink-700 hover:bg-slate-200/70 focus:outline-none cursor-pointer"
              >
                {DEPARTMENT_LINKS.map((dept) => (
                  <option key={dept.slug} value={dept.slug}>
                    {dept.label}
                  </option>
                ))}
              </select>

              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for headphones, creator laptops, smartwatches, brands and more..."
                aria-label="Search products"
                className="w-full flex-1 bg-white px-4 py-2.5 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none"
              />

              <button
                type="submit"
                aria-label="Submit search"
                className="inline-flex items-center justify-center bg-accent-500 px-5 text-white hover:bg-accent-600 active:bg-accent-700 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Right: Account Dropdown, Orders Link & Cart Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Account Menu */}
            <div className="relative">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left hover:bg-white/10 transition"
                aria-label="Account menu"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white ring-1 ring-white/20">
                  {user ? initials : <User className="h-4 w-4 text-slate-200" />}
                </div>
                <div className="hidden sm:block leading-tight">
                  <span className="block text-[11px] text-slate-300">
                    {user ? `Hello, ${user.name.split(" ")[0]}` : "Hello, Sign in"}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-white">
                    Account &amp; Lists
                    <ChevronDown className="h-3 w-3 text-slate-400" />
                  </span>
                </div>
              </button>

              {accountMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAccountMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-3.5 text-ink-900 shadow-card-hover">
                    {user ? (
                      <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-bold text-white shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-bold text-ink-900 truncate">
                              {user.name}
                            </p>
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                user.role === "ADMIN"
                                  ? "bg-primary-100 text-primary-800"
                                  : "bg-success-100 text-success-800"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-b border-slate-100 pb-3 mb-2.5 text-center space-y-2">
                        <Link
                          href="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
                        >
                          Sign In / Create Account
                        </Link>
                        <p className="text-[11px] text-slate-500">
                          Sign in for faster checkout &amp; order tracking
                        </p>
                      </div>
                    )}

                    <div className="space-y-1 text-xs">
                      <Link
                        href="/products"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-ink-700 hover:bg-slate-100 transition"
                      >
                        <Package className="h-4 w-4 text-slate-400" />
                        Browse All Products
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setAccountMenuOpen(false)}
                        className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 font-medium text-ink-700 hover:bg-slate-100 transition"
                      >
                        <ClipboardList className="h-4 w-4 text-slate-400" />
                        My Orders &amp; Returns
                      </Link>
                      {user?.role === "ADMIN" && (
                        <Link
                          href="/dashboard"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 rounded-lg bg-primary-50 px-2.5 py-2 font-bold text-primary-700 hover:bg-primary-100 transition"
                        >
                          <LayoutDashboard className="h-4 w-4 text-primary-600" />
                          Store Admin Dashboard
                        </Link>
                      )}
                    </div>

                    {user && (
                      <div className="mt-2.5 border-t border-slate-100 pt-2">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-danger-600 hover:bg-danger-50 transition"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Returns & Orders Shortcut (Desktop) */}
            <Link
              href="/orders"
              className="hidden lg:flex flex-col rounded-xl px-2.5 py-1.5 leading-tight hover:bg-white/10 transition"
            >
              <span className="text-[11px] text-slate-300">Returns</span>
              <span className="text-xs font-bold text-white">&amp; Orders</span>
            </Link>

            {/* Cart Link */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/15 px-3 py-2 text-sm font-bold text-white transition"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-white" />
                <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent-500 px-1 text-[11px] font-extrabold text-white shadow-sm">
                  {isHydrated ? totalItems : 0}
                </span>
              </div>
              <span className="hidden sm:inline pl-1 text-xs font-bold">
                Cart
              </span>
            </Link>
          </div>
        </div>

        {/* Mobile Full-Width Search Bar directly below Main Row */}
        <div className="md:hidden px-4 pb-3">
          <form onSubmit={handleSearchSubmit} className="flex w-full">
            <div className="flex w-full overflow-hidden rounded-xl bg-white shadow-sm">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ShopSphere.in..."
                aria-label="Search products"
                className="w-full flex-1 bg-white px-3.5 py-2 text-sm text-ink-900 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Submit search"
                className="inline-flex items-center justify-center bg-accent-500 px-4 text-white"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tier 3: Horizontal Category Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-slate-200">
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 text-xs">
          <nav
            aria-label="Store departments"
            className="flex items-center gap-1 overflow-x-auto"
          >
            {DEPARTMENT_LINKS.map((dept) => {
              const isActive =
                dept.slug === "all"
                  ? pathname === "/products"
                  : false;
              return (
                <Link
                  key={dept.slug}
                  href={dept.href}
                  className={`rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-ink-700 hover:bg-slate-100 hover:text-primary-600"
                  }`}
                >
                  {dept.label}
                </Link>
              );
            })}
            <Link
              href="/products?featured=true"
              className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 font-bold text-accent-600 hover:bg-accent-50 whitespace-nowrap transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Today&apos;s Deals
            </Link>
          </nav>

          <Link
            href="/products?sort=newest"
            className="hidden xl:inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-primary-600 transition-colors"
          >
            New Releases →
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-4 text-ink-900 shadow-lg">
          <div className="space-y-1">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Shop by Department
            </p>
            {DEPARTMENT_LINKS.map((dept) => (
              <Link
                key={dept.slug}
                href={dept.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium text-ink-800 hover:bg-slate-100"
              >
                <span>{dept.label}</span>
              </Link>
            ))}
            <Link
              href="/products?featured=true"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-bold text-accent-600 hover:bg-accent-50"
            >
              <Sparkles className="h-4 w-4" />
              Today&apos;s Deals
            </Link>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-1">
            <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Your Account
            </p>
            <Link
              href="/orders"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium text-ink-800 hover:bg-slate-100"
            >
              <ClipboardList className="h-4 w-4 text-primary-600" />
              My Orders
            </Link>
            {user?.role === "ADMIN" && (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg bg-primary-50 px-2.5 py-2 text-sm font-bold text-primary-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                Store Admin Dashboard
              </Link>
            )}
            {!user ? (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-xl bg-primary-600 px-3 py-2.5 text-sm font-bold text-white mt-2"
              >
                Sign In / Create Account
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-danger-600 hover:bg-danger-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out ({user.name})
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
