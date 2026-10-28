// ============================================================================
// ShopSphere Storefront Homepage (src/app/page.tsx)
// Experiment 1: React Server Component Fetching Hybrid Database Data
// Experiment 2: Responsive Tailwind CSS Design System (Hero, Categories, Product Grid)
// ============================================================================
import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  Database,
  Layers,
  Sparkles,
  CheckCircle2,
  Package,
  LayoutDashboard,
} from "lucide-react";
import { StorefrontLayout } from "@/components/layout/storefront-layout";
import { ProductCard } from "@/components/products/product-card";
import {
  getDatabaseHealthStatus,
  listCategories,
  listProducts,
} from "@/lib/mongodb/product-service";
import { getCurrentUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allProducts, categories, health, user] = await Promise.all([
    listProducts({ sort: "featured" }),
    listCategories(),
    getDatabaseHealthStatus(),
    getCurrentUser(),
  ]);

  const featuredProducts = allProducts.filter((p) => p.featured).slice(0, 4);
  const catalogPreview = allProducts.slice(0, 8);

  return (
    <StorefrontLayout>
      {/* Hero Section */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
                <Sparkles className="h-3.5 w-3.5" />
                <span>ShopSphere Full-Stack Marketplace • Indian Rupees (₹ INR)</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Precision Tech &amp; Workspace Gear for{" "}
                <span className="text-indigo-600">Builders &amp; Creators</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                Explore studio-grade ANC headphones, developer ultrabooks,
                QMK/VIA mechanical keyboards, and smart home essentials — backed
                by a hybrid{" "}
                <strong className="font-semibold text-slate-800">
                  MySQL (Prisma)
                </strong>{" "}
                transactional inventory engine and a{" "}
                <strong className="font-semibold text-slate-800">
                  MongoDB (Mongoose)
                </strong>{" "}
                document catalog.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
                >
                  Browse Full Catalog ({allProducts.length})
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {user?.role === "ADMIN" ? (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Open Admin Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    {user ? "Switch Account / Role" : "Sign In / OAuth Demo"}
                  </Link>
                )}
              </div>

              {/* Trust Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Free Express Shipping above ₹2,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>ACID Inventory Verification on Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                  <span>Role-Based Access (Guest / Customer / Admin)</span>
                </div>
              </div>
            </div>

            {/* Right Column: Hybrid Architecture Live Status Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                      Dual-Database Architecture
                    </span>
                    <h2 className="text-base font-bold text-slate-900">
                      Live System &amp; Storage Telemetry
                    </h2>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      health.mode === "hybrid-live"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-indigo-100 text-indigo-800"
                    }`}
                  >
                    {health.mode === "hybrid-live"
                      ? "Hybrid Live"
                      : "Persistent Local Ready"}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Database className="h-4 w-4 text-indigo-600" />
                        MySQL + Prisma ORM (Exp 5)
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          health.mysqlConnected
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {health.mysqlConnected ? "CONNECTED" : "FALLBACK STORE"}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Owns Users, Better Auth Sessions, Roles, Categories,
                      relational <code className="font-mono text-indigo-700">InventoryItem</code>{" "}
                      stock, and ACID <code className="font-mono text-indigo-700">Order</code>{" "}
                      transactions.
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-4 w-4 text-emerald-600" />
                        MongoDB + Mongoose ODM (Exp 6)
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                          health.mongoConnected
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {health.mongoConnected ? "CONNECTED" : "FALLBACK STORE"}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Owns rich Product Catalog documents, embedded specifications,
                      tags, and search indexes linked via stable{" "}
                      <code className="font-mono text-indigo-700">catalogProductId</code>.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
                  <span>Active Session Role:</span>
                  <span className="font-bold text-slate-800">
                    {user ? `${user.name} (${user.role})` : "Guest Visitor (GUEST)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Section */}
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Browse by Department
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              Curated Product Categories
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
          >
            View all products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-indigo-300 hover:shadow-md transition"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Package className="h-5 w-5" />
                </div>
                <h3 className="mt-3.5 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                  {cat.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-600">
                <span>{cat.productCount ?? 0} Products</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                Editor&apos;s Picks
              </span>
              <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
                Featured Flagship Releases
              </h2>
            </div>
            <Link
              href="/products?featured=true"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1"
            >
              Filter featured items <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* Full Catalog Preview */}
      <section className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Complete Inventory
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-0.5">
              All Available Gear &amp; Appliances
            </h2>
          </div>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Open Search &amp; Filters <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {catalogPreview.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </StorefrontLayout>
  );
}
