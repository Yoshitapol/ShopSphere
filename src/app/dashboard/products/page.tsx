// ============================================================================
// ShopSphere Admin Product & Inventory Management Page (/dashboard/products)
// Experiment 2 & 14: Responsive Product Table, Search/Filter & CRUD Actions
// ============================================================================
import React from "react";
import Link from "next/link";
import {
  PlusCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { ProductTableActions } from "@/components/dashboard/product-table-actions";
import { listCategories, listProducts } from "@/lib/mongodb/product-service";
import { requireAdminUser } from "@/lib/permissions/rbac";
import { formatInr } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
  }>;
}

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  await requireAdminUser("/dashboard/products");
  const { search, category } = await searchParams;

  const [products, categories] = await Promise.all([
    listProducts({ search, category }),
    listCategories(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Experiment 4, 5 &amp; 6: Catalog &amp; Warehouse Inventory CRUD
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            Products &amp; Inventory ({products.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mutations synchronize MongoDB catalog documents and MySQL
            InventoryItem records.
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 transition self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Create New Product
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        action="/dashboard/products"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Filter by product name, SKU, or brand..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-slate-900"
          />
        </div>

        <select
          name="category"
          defaultValue={category ?? "all"}
          aria-label="Filter by category"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
        >
          Filter Table
        </button>

        {(search || (category && category !== "all")) && (
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Responsive Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5 text-left">Product</th>
                <th className="px-4 py-3.5 text-left">SKU / ID</th>
                <th className="px-4 py-3.5 text-left">Category</th>
                <th className="px-4 py-3.5 text-right">Price (INR)</th>
                <th className="px-4 py-3.5 text-center">Warehouse Stock</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {products.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No products match the current filter.
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isOut = product.stockQuantity <= 0;
                  const isLow =
                    !isOut &&
                    product.stockQuantity <= product.reorderThreshold;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/70 transition"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {product.brand} •{" "}
                              {product.specifications.length} specs
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-slate-800">
                          {product.sku}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {product.id}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
                          {product.categoryName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">
                        {formatInr(product.priceInr)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-rose-100 px-2.5 py-1 font-bold text-rose-800">
                            <XCircle className="h-3.5 w-3.5" />
                            Out (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 font-bold text-amber-900">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Low ({product.stockQuantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1 font-bold text-emerald-800">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {product.stockQuantity} units
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <ProductTableActions
                          productId={product.id}
                          productSlug={product.slug}
                          productName={product.name}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
