// ============================================================================
// ShopSphere Product Catalog Page (/products)
// Experiment 1: Async searchParams in Next.js App Router Server Component
// Experiment 2: Search Bar, Category & Price Filters, Product Cards & Empty State
// ============================================================================
import React from "react";
import Link from "next/link";
import { PackageSearch, PlusCircle } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import { ProductFilters } from "@/components/products/product-filters";
import {
  listCategories,
  listProducts,
  type ProductFilterOptions,
} from "@/lib/mongodb/product-service";
import { getCurrentUser } from "@/lib/permissions/rbac";

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            MongoDB Document Catalog + MySQL Live Stock
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
            Explore ShopSphere Catalog
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Showing{" "}
            <strong className="font-semibold text-slate-900">
              {products.length}
            </strong>{" "}
            {products.length === 1 ? "product" : "products"} priced in Indian
            Rupees (₹ INR).
          </p>
        </div>

        {user?.role === "ADMIN" && (
          <Link
            href="/dashboard/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition self-start sm:self-auto"
          >
            <PlusCircle className="h-4 w-4" />
            Add New Product (Admin)
          </Link>
        )}
      </div>

      {/* Interactive Search & Filters */}
      <ProductFilters
        categories={categories}
        initialSearch={resolvedParams.search ?? ""}
        initialCategory={resolvedParams.category ?? "all"}
        initialMinPrice={resolvedParams.minPrice ?? ""}
        initialMaxPrice={resolvedParams.maxPrice ?? ""}
        initialSort={resolvedParams.sort ?? "featured"}
        initialInStock={resolvedParams.inStock === "true"}
      />

      {/* Product Grid or Empty State */}
      {products.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm max-w-lg mx-auto my-8 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <PackageSearch className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            No Matching Products Found
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            We couldn&apos;t find any catalog items matching your current search or
            price filter criteria. Try clearing your filters or searching a
            broader term.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
            >
              Reset All Filters
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
