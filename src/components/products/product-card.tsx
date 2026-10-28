"use client";

// ============================================================================
// ShopSphere Product Card Component
// Experiment 2: Product Cards with Images, INR Prices, Ratings & Stock Status
// ============================================================================
import React from "react";
import Link from "next/link";
import { Star, ShoppingCart, Check, AlertTriangle } from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import {
  calculateDiscountPercent,
  formatInr,
} from "@/lib/utils/format";
import type { ProductCatalogItem } from "@/types";

interface ProductCardProps {
  product: ProductCatalogItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const { showToast } = useToast();

  const discount = calculateDiscountPercent(
    product.priceInr,
    product.originalPriceInr
  );
  const inCartItem = items.find((i) => i.catalogProductId === product.id);
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.reorderThreshold;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (inCartItem && inCartItem.quantity >= product.stockQuantity) {
      showToast(
        `Maximum available stock (${product.stockQuantity}) already in cart.`,
        "info"
      );
      return;
    }

    addItem(
      {
        catalogProductId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        priceInr: product.priceInr,
        image: product.images[0] ?? "",
        categoryName: product.categoryName,
        maxStock: product.stockQuantity,
      },
      1
    );
    showToast(`Added "${product.name}" to cart`, "success");
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      {/* Image Container */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {discount > 0 && (
            <span className="rounded-lg bg-indigo-600 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              {discount}% OFF
            </span>
          )}
          {product.featured && (
            <span className="rounded-lg bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* Stock Status Pill */}
        <div className="absolute bottom-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-600/95 px-2 py-0.5 text-[11px] font-semibold text-white">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="inline-flex items-center gap-1 rounded-lg bg-amber-500/95 px-2 py-0.5 text-[11px] font-semibold text-white">
              <AlertTriangle className="h-3 w-3" />
              Only {product.stockQuantity} left
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-lg bg-slate-900/75 backdrop-blur px-2 py-0.5 text-[11px] font-medium text-white">
              In Stock ({product.stockQuantity})
            </span>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
          <span className="font-medium text-indigo-600 truncate">
            {product.categoryName}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 shrink-0">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
            <span className="text-slate-400 font-normal">
              ({product.reviewCount})
            </span>
          </span>
        </div>

        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-2 leading-snug"
        >
          {product.name}
        </Link>

        <p className="mt-1.5 text-xs text-slate-600 line-clamp-2 flex-1">
          {product.shortDescription}
        </p>

        {/* Price & Action Footer */}
        <div className="mt-4 flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                {formatInr(product.priceInr)}
              </span>
              {product.originalPriceInr &&
                product.originalPriceInr > product.priceInr && (
                  <span className="text-xs text-slate-400 line-through">
                    {formatInr(product.originalPriceInr)}
                  </span>
                )}
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              SKU: {product.sku}
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              isOutOfStock
                ? "cursor-not-allowed bg-slate-100 text-slate-400"
                : inCartItem
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
            }`}
          >
            {inCartItem ? (
              <>
                <Check className="h-3.5 w-3.5" />
                In Cart ({inCartItem.quantity})
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
