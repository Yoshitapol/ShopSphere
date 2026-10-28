import React from "react";
import Link from "next/link";
import { PackageSearch, PlusCircle, X } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import { Breadcrumb } from "@/components/ui/storefront-helpers";
import {
  listCategories,
  listProducts,
  type ProductFilterOptions,
} from "@/lib/mongodb/product-service";
import { getCurrentUser } from "@/lib/permissions/rbac";
import { formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface ProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    featured?: string;
    inStock?: string;
  }>;
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const resolvedParams = await searchParams;

  const filters: ProductFilterOptions = {
    search: resolvedParams.search,
    category: resolvedParams.category,
    minPrice: resolvedParams.minPrice
      ? Number(resolvedParams.minPrice)
      : undefined,
    maxPrice: resolvedParams.maxPrice
      ? Number(resolvedParams.maxPrice)
      : undefined,
    sort: (resolvedParams.sort as ProductFilterOptions["sort"]) || "featured",
    featuredOnly: resolvedParams.featured === "true",
    inStockOnly: resolvedParams.inStock === "true",
  };

  const [products, categories, user] = await Promise.all([
    listProducts(filters),
    listCategories(),
    getCurrentUser(),
  ]);

  const activeCategoryObj = categories.find(
    (c) => c.slug === resolvedParams.category || c.id === resolvedParams.category
  );

  // Build removable active filter chips
  const activeChips: { label: string; clearHref: string }[] = [];
  const buildUrlWithout = (keysToRemove: string[]) => {
    const p = new URLSearchParams();
    Object.entries(resolvedParams).forEach(([k, v]) => {
      if (v && !keysToRemove.includes(k)) p.set(k, v);
    });
    const qs = p.toString();
    return qs ? `/products?${qs}` : "/products";
  };

  if (resolvedParams.search) {
    activeChips.push({
      label: `Search: "${resolvedParams.search}"`,
      clearHref: buildUrlWithout(["search"]),
    });
  }
  if (resolvedParams.category && resolvedParams.category !== "all") {
    activeChips.push({
      label: activeCategoryObj?.name ?? resolvedParams.category,
      clearHref: buildUrlWithout(["category"]),
    });
  }
  if (resolvedParams.minPrice || resolvedParams.maxPrice) {
    const minLabel = resolvedParams.minPrice
      ? formatInr(Number(resolvedParams.minPrice))
      : "₹0";
    const maxLabel = resolvedParams.maxPrice
      ? formatInr(Number(resolvedParams.maxPrice))
      : "Any";
    activeChips.push({
      label: `Price: ${minLabel} – ${maxLabel}`,
      clearHref: buildUrlWithout(["minPrice", "maxPrice"]),
    });
  }
  if (resolvedParams.featured === "true") {
    activeChips.push({
      label: "Deals of the Day",
      clearHref: buildUrlWithout(["featured"]),
    });
  }
  if (resolvedParams.inStock === "true") {
    activeChips.push({
      label: "In Stock Only",
      clearHref: buildUrlWithout(["inStock"]),
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
      {/* Top Bar: Breadcrumbs & Admin Shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          items={
            activeCategoryObj
              ? [
                  { label: "All Products", href: "/products" },
                  { label: activeCategoryObj.name },
                ]
              : [{ label: "All Products" }]
          }
        />

        {user?.role === "ADMIN" && (
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-slate-50 transition"
          >
            <PlusCircle className="h-3.5 w-3.5 text-primary-600" />
            Add Product
          </Link>
        )}
      </div>

      {/* Main Two-Column Storefront Layout: Left Filters Sidebar + Right Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Sidebar Filters (Desktop) / Drawer Trigger (Mobile) */}
        <div className="lg:col-span-3">
          <ProductFilters
            categories={categories}
            initialSearch={resolvedParams.search ?? ""}
            initialCategory={resolvedParams.category ?? "all"}
            initialMinPrice={resolvedParams.minPrice ?? ""}
            initialMaxPrice={resolvedParams.maxPrice ?? ""}
            initialSort={resolvedParams.sort ?? "featured"}
            initialInStock={resolvedParams.inStock === "true"}
          />
        </div>

        {/* Right Column: Header, Active Chips & Product Grid */}
        <div className="lg:col-span-9 space-y-4">
          {/* Listing Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200/90 bg-white px-5 py-4 shadow-card">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-ink-900">
                {activeCategoryObj
                  ? activeCategoryObj.name
                  : resolvedParams.featured === "true"
                  ? "Today's Featured Deals"
                  : resolvedParams.search
                  ? `Results for "${resolvedParams.search}"`
                  : "All Electronics & Gear"}
              </h1>
              {activeCategoryObj?.description && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeCategoryObj.description}
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-500 shrink-0">
              Showing{" "}
              <strong className="font-extrabold text-ink-900">
                {products.length}
              </strong>{" "}
              {products.length === 1 ? "item" : "items"}
            </p>
          </div>

          {/* Active Filter Chips */}
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">
                Active filters:
              </span>
              {activeChips.map((chip) => (
                <Link
                  key={chip.label}
                  href={chip.clearHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-800 hover:bg-primary-100 transition"
                >
                  <span>{chip.label}</span>
                  <X className="h-3 w-3" />
                </Link>
              ))}
              <Link
                href="/products"
                className="text-xs font-bold text-slate-500 hover:text-ink-900 underline ml-1"
              >
                Reset all
              </Link>
            </div>
          )}

          {/* Product Grid or Polished Empty State */}
          {products.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-card max-w-lg mx-auto my-6 space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
                <PackageSearch className="h-8 w-8" />
              </div>
              <h2 className="text-lg font-extrabold text-ink-900">
                No Matching Products Found
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                We couldn&apos;t find any items matching your selected filters or
                search query. Try removing a filter or browsing all categories.
              </p>
              <div className="pt-2">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
                >
                  Clear All Filters
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
