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
          <span className="text-xs font-bold uppercase tracking-wider text-primary-600">
            Catalog &amp; Warehouse Management
          </span>
          <h2 className="text-2xl font-extrabold text-ink-900 mt-0.5">
            Products &amp; Inventory ({products.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new products, update pricing, and monitor low-stock thresholds.
          </p>
        </div>

        <Link
          href="/dashboard/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition self-start sm:self-auto"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Product
        </Link>
      </div>

      {/* Filter Bar */}
      <form
        method="GET"
        action="/dashboard/products"
        className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center gap-3"
      >
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-2.5 pointer-events-none" />
          <input
            type="search"
            name="search"
            defaultValue={search ?? ""}
            placeholder="Filter by product name, SKU, or brand..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2 text-xs text-ink-900 focus:border-primary-500 focus:bg-white"
          />
        </div>

        <select
          name="category"
          defaultValue={category ?? "all"}
          aria-label="Filter by category"
          className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-ink-800"
        >
          <option value="all">All Departments</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="rounded-xl bg-ink-900 px-4 py-2 text-xs font-bold text-white hover:bg-ink-800 transition"
        >
          Filter
        </button>

        {(search || (category && category !== "all")) && (
          <Link
            href="/dashboard/products"
            className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Clear
          </Link>
        )}
      </form>

      {/* Responsive Products Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3.5 text-left">Product</th>
                <th className="px-4 py-3.5 text-left">SKU</th>
                <th className="px-4 py-3.5 text-left">Department</th>
                <th className="px-4 py-3.5 text-right">Price (INR)</th>
                <th className="px-4 py-3.5 text-center">Inventory Status</th>
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
                products.map((product, idx) => {
                  const isOut = product.stockQuantity <= 0;
                  const isLow =
                    !isOut &&
                    product.stockQuantity <= product.reorderThreshold;

                  return (
                    <tr
                      key={product.id}
                      className={`${
                        idx % 2 === 1 ? "bg-slate-50/40" : "bg-white"
                      } hover:bg-primary-50/30 transition-colors`}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white p-1">
                            <ProductImage
                              src={product.images[0]}
                              alt={product.name}
                              fit="contain"
                              className="h-full w-full"
                            />
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-ink-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {product.brand} · {product.specifications.length}{" "}
                              specs
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono font-bold text-ink-800">
                        {product.sku}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-semibold text-ink-700">
                          {product.categoryName}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-right font-extrabold text-ink-900">
                        {formatInr(product.priceInr)}
                      </td>

                      <td className="px-4 py-3.5 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger-200 px-2.5 py-0.5 font-bold text-danger-700">
                            <XCircle className="h-3.5 w-3.5" />
                            Out (0)
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 border border-warning-200 px-2.5 py-0.5 font-bold text-warning-800">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Low ({product.stockQuantity})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success-50 border border-success-200 px-2.5 py-0.5 font-bold text-success-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {product.stockQuantity} in stock
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
