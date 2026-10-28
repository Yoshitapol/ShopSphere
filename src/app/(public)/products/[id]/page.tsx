import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Tag,
  Award,
  Star,
} from "lucide-react";
import { AddToCartDetailWidget } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
import {
  Breadcrumb,
  ProductGallery,
  StarRating,
} from "@/components/ui/storefront-helpers";
import {
  getProductByIdOrSlug,
  listProducts,
} from "@/lib/mongodb/product-service";
import { getCurrentUser } from "@/lib/permissions/rbac";
import {
  calculateDiscountPercent,
  formatInr,
} from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;
  const [product, user] = await Promise.all([
    getProductByIdOrSlug(id),
    getCurrentUser(),
  ]);

  if (!product) {
    notFound();
  }

  const allCategoryProducts = await listProducts({
    category: product.categorySlug,
  });
  const relatedProducts = allCategoryProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const discount = calculateDiscountPercent(
    product.priceInr,
    product.originalPriceInr
  );
  const savingsInr =
    product.originalPriceInr && product.originalPriceInr > product.priceInr
      ? product.originalPriceInr - product.priceInr
      : 0;
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.reorderThreshold;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 space-y-12">
      {/* Top Bar: Breadcrumb & Subtle Admin Edit Link */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Breadcrumb
          items={[
            { label: "Products", href: "/products" },
            {
              label: product.categoryName,
              href: `/products?category=${product.categorySlug}`,
            },
            { label: product.name },
          ]}
        />

        {user?.role === "ADMIN" && (
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-700 hover:bg-slate-50 transition"
          >
            <Pencil className="h-3.5 w-3.5 text-primary-600" />
            Edit Product
          </Link>
        )}
      </div>

      {/* Main Two-Column Product Showcase */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left: Interactive Image Gallery */}
        <div className="lg:col-span-6">
          <ProductGallery
            images={product.images}
            productName={product.name}
            discount={discount}
          />
        </div>

        {/* Right: Sticky Buy Box */}
        <div className="lg:col-span-6 lg:sticky lg:top-28">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-5">
            {/* Brand & Category */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700">
                  {product.brand}
                </span>
                <Link
                  href={`/products?category=${product.categorySlug}`}
                  className="text-xs font-medium text-slate-500 hover:text-primary-600 transition-colors"
                >
                  in {product.categoryName}
                </Link>
              </div>

              {/* Clean Stock Status Pill */}
              {isOutOfStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-danger-50 border border-danger-200 px-3 py-1 text-xs font-bold text-danger-700">
                  Out of stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-50 border border-warning-200 px-3 py-1 text-xs font-bold text-warning-800">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning-600" />
                  Only {product.stockQuantity} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-success-50 border border-success-200 px-3 py-1 text-xs font-bold text-success-700">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success-600" />
                  In stock
                </span>
              )}
            </div>

            {/* Product Title & Rating */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-ink-900 leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <StarRating
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  size="md"
                />
                <span className="text-slate-300">|</span>
                <span className="text-xs text-slate-500">
                  Item model: <strong className="text-ink-700">{product.sku}</strong>
                </span>
              </div>
            </div>

            {/* Price & Savings Block */}
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 space-y-1.5">
              <div className="flex flex-wrap items-baseline gap-2.5">
                <span className="text-3xl font-extrabold text-ink-900">
                  {formatInr(product.priceInr)}
                </span>
                {product.originalPriceInr &&
                  product.originalPriceInr > product.priceInr && (
                    <span className="text-sm text-slate-400 line-through">
                      MRP {formatInr(product.originalPriceInr)}
                    </span>
                  )}
                {discount > 0 && (
                  <span className="rounded-md bg-success-600 px-2 py-0.5 text-xs font-extrabold text-white">
                    {discount}% OFF
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-slate-500">
                  Inclusive of all taxes • Official GST invoice provided
                </span>
                {savingsInr > 0 && (
                  <span className="font-bold text-success-700">
                    You save {formatInr(savingsInr)}
                  </span>
                )}
              </div>
            </div>

            {/* Short Highlights */}
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.shortDescription}
            </p>

            {/* Delivery Estimate Box */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 flex items-start gap-3 text-xs">
              <Truck className="h-4 w-4 text-primary-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-ink-900">
                  {product.priceInr >= 2000
                    ? "FREE Express Delivery across India"
                    : "Standard Delivery available across India"}
                </p>
                <p className="text-slate-500">
                  Order within 4 hrs for dispatch within 24 hours with live
                  tracking.
                </p>
              </div>
            </div>

            {/* Quantity & Add to Cart / Buy Now */}
            <div className="pt-1">
              <AddToCartDetailWidget product={product} />
            </div>

            {/* 3 Trust Badges */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-[11px] text-slate-600">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 p-2.5">
                <ShieldCheck className="h-4 w-4 text-primary-600" />
                <span className="font-semibold text-ink-800">
                  {product.warranty}
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 p-2.5">
                <RotateCcw className="h-4 w-4 text-primary-600" />
                <span className="font-semibold text-ink-800">
                  7-Day Replacement
                </span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-slate-50 p-2.5">
                <Award className="h-4 w-4 text-primary-600" />
                <span className="font-semibold text-ink-800">
                  100% Genuine Brand
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Overview, Specifications & Customer Rating Breakdown */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left 7 Cols: Detailed Overview & Technical Specs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Product Description */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-3">
            <h2 className="text-lg font-extrabold text-ink-900">
              Product Overview
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
            {product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-3">
                <Tag className="h-3.5 w-3.5 text-slate-400 mr-1" />
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/products?search=${encodeURIComponent(tag)}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-primary-50 hover:text-primary-700 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </section>

          {/* Technical Specifications Table */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card space-y-4">
            <h2 className="text-lg font-extrabold text-ink-900">
              Technical Specifications
            </h2>

            {product.specifications.length === 0 ? (
              <p className="text-xs text-slate-500">
                Standard manufacturer specifications apply.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="bg-slate-50/70">
                      <th className="w-2/5 px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Brand
                      </th>
                      <td className="px-4 py-3 text-sm font-semibold text-ink-900">
                        {product.brand}
                      </td>
                    </tr>
                    {product.specifications.map((spec, index) => (
                      <tr
                        key={index}
                        className={
                          index % 2 === 1 ? "bg-slate-50/70" : "bg-white"
                        }
                      >
                        <th className="w-2/5 px-4 py-3 text-left text-xs font-bold text-slate-500">
                          {spec.label}
                        </th>
                        <td className="px-4 py-3 text-sm font-medium text-ink-900">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-50/70">
                      <th className="w-2/5 px-4 py-3 text-left text-xs font-bold text-slate-500">
                        Warranty
                      </th>
                      <td className="px-4 py-3 text-sm font-medium text-ink-900">
                        {product.warranty}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Right 4 Cols: Customer Reviews Summary */}
        <div className="lg:col-span-4">
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-5">
            <h2 className="text-lg font-extrabold text-ink-900">
              Customer Ratings
            </h2>

            <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
              <div className="text-center">
                <span className="text-3xl font-extrabold text-ink-900">
                  {product.rating.toFixed(1)}
                </span>
                <span className="block text-xs text-slate-500">out of 5</span>
              </div>
              <div className="space-y-1">
                <StarRating rating={product.rating} size="md" />
                <p className="text-xs text-slate-500">
                  Based on {product.reviewCount.toLocaleString("en-IN")} verified
                  ratings
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { stars: 5, pct: 74 },
                { stars: 4, pct: 18 },
                { stars: 3, pct: 5 },
                { stars: 2, pct: 2 },
                { stars: 1, pct: 1 },
              ].map((row) => (
                <div key={row.stars} className="flex items-center gap-2.5">
                  <span className="w-10 font-semibold text-slate-600 inline-flex items-center gap-0.5">
                    {row.stars} <Star className="h-3 w-3 fill-warning-400 text-warning-400" />
                  </span>
                  <div className="flex-1 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-warning-400"
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-slate-500">
                    {row.pct}%
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
              Ratings are calculated from verified ShopSphere purchases across
              India.
            </p>
          </section>
        </div>
      </div>

      {/* You May Also Like */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-ink-900">
              You May Also Like
            </h2>
            <Link
              href={`/products?category=${product.categorySlug}`}
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              View more in {product.categoryName} →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
