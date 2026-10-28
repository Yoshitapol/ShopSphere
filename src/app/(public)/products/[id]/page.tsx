// ============================================================================
// ShopSphere Dynamic Product Detail Page (/products/[id])
// Experiment 1: Async Dynamic Route Params & Server Component Data Fetching
// Experiment 6: Rendering Mongoose Embedded Specifications & Tags
// ============================================================================
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Star,
  ShieldCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Pencil,
  Tag,
  Cpu,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { AddToCartDetailWidget } from "@/components/products/add-to-cart-button";
import { ProductCard } from "@/components/products/product-card";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Breadcrumb & Admin Edit Shortcut */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 font-semibold text-indigo-600 hover:text-indigo-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Catalog
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.categorySlug}`}
            className="hover:text-slate-900"
          >
            {product.categoryName}
          </Link>
          <span>/</span>
          <span className="text-slate-700 font-medium truncate max-w-[200px]">
            {product.name}
          </span>
        </div>

        {user?.role === "ADMIN" && (
          <Link
            href={`/dashboard/products/${product.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Product in Admin Dashboard
          </Link>
        )}
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left: Product Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              className="h-full w-full"
            />
          </div>

          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] overflow-hidden rounded-xl border border-slate-200 bg-white"
                >
                  <ProductImage
                    src={img}
                    alt={`${product.name} view ${i + 1}`}
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info, Pricing & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
            {/* Category, Brand & Rating */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">
                  {product.categoryName}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  by {product.brand}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/70 px-2.5 py-1 text-xs font-bold text-amber-900">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)}
                <span className="font-normal text-amber-700">
                  ({product.reviewCount} verified reviews)
                </span>
              </div>
            </div>

            {/* Title & SKU */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="font-mono">SKU: {product.sku}</span>
                <span>•</span>
                <span className="font-mono">Catalog ID: {product.id}</span>
              </div>
            </div>

            {/* Price Block */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 flex flex-wrap items-baseline justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-2.5">
                  <span className="text-3xl font-extrabold text-slate-900">
                    {formatInr(product.priceInr)}
                  </span>
                  {product.originalPriceInr &&
                    product.originalPriceInr > product.priceInr && (
                      <span className="text-sm text-slate-400 line-through">
                        MRP {formatInr(product.originalPriceInr)}
                      </span>
                    )}
                  {discount > 0 && (
                    <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-xs font-bold text-white">
                      Save {discount}%
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Price in Indian Rupees (₹ INR). GST invoice available on
                  checkout.
                </p>
              </div>

              {/* Relational Stock Status */}
              <div>
                {product.stockQuantity <= 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-800">
                    Out of Stock
                  </span>
                ) : product.stockQuantity <= product.reorderThreshold ? (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-900">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Low Stock ({product.stockQuantity} left)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    In Stock ({product.stockQuantity} units)
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">
                {product.shortDescription}
              </p>
              <p>{product.description}</p>
            </div>

            {/* Interactive Add to Cart Widget */}
            <div className="pt-2 border-t border-slate-100">
              <AddToCartDetailWidget product={product} />
            </div>

            {/* Warranty & Delivery Assurances */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600 shrink-0" />
                <span>Free Express Delivery across India</span>
              </div>
            </div>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2">
                <Tag className="h-3.5 w-3.5 text-slate-400 mr-1" />
                {product.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/products?search=${encodeURIComponent(tag)}`}
                    className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-700 transition"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Embedded Technical Specifications Table (Experiment 6) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-600" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Technical Specifications
            </h2>
            <p className="text-xs text-slate-500">
              Stored as embedded subdocuments in the MongoDB Product Catalog
              document (Experiment 6).
            </p>
          </div>
        </div>

        {product.specifications.length === 0 ? (
          <p className="text-xs text-slate-500">
            Standard manufacturer specifications apply.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <tbody className="divide-y divide-slate-200 bg-white">
                {product.specifications.map((spec, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-slate-50/60" : "bg-white"}
                  >
                    <th className="w-1/3 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                      {spec.label}
                    </th>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {spec.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-slate-900">
            More in {product.categoryName}
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
