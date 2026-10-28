"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Truck,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";
import { ProductImage } from "@/components/ui/product-image";
import { StarRating } from "@/components/ui/storefront-helpers";
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
  const { addItem, updateQuantity, removeItem, items } = useCart();
  const { showToast } = useToast();
  const [wishlisted, setWishlisted] = useState(false);

  const discount = calculateDiscountPercent(
    product.priceInr,
    product.originalPriceInr
  );
  const inCartItem = items.find((i) => i.catalogProductId === product.id);
  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
  const isLowStock =
    !isOutOfStock && product.stockQuantity <= product.reorderThreshold;
  const qualifiesFreeDelivery = product.priceInr >= 2000;

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !wishlisted;
    setWishlisted(next);
    showToast(
      next
        ? `Saved "${product.name}" to your wishlist`
        : `Removed "${product.name}" from wishlist`,
      "info"
    );
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    if (inCartItem && inCartItem.quantity >= product.stockQuantity) {
      showToast(
        `Maximum available quantity (${product.stockQuantity}) is already in your cart.`,
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      {/* Top-Left Discount / Bestseller Badge */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 pointer-events-none">
        {discount > 0 && (
          <span className="rounded-md bg-success-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
            -{discount}%
          </span>
        )}
        {product.featured && !discount && (
          <span className="rounded-md bg-accent-500 px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
            Bestseller
          </span>
        )}
      </div>

      {/* Top-Right Wishlist Button */}
      <button
        type="button"
        onClick={handleToggleWishlist}
        aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        className={`absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur transition-all ${
          wishlisted
            ? "border-danger-200 bg-danger-50 text-danger-600"
            : "border-slate-200/80 bg-white/90 text-slate-400 hover:text-danger-500 hover:border-slate-300"
        }`}
      >
        <Heart className={`h-4 w-4 ${wishlisted ? "fill-danger-500" : ""}`} />
      </button>

      {/* 1:1 Product Image Area */}
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden bg-slate-50/70 p-5 flex items-center justify-center border-b border-slate-100"
      >
        <ProductImage
          src={product.images[0]}
          alt={product.name}
          fit="contain"
          className="h-full w-full group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      {/* Card Body */}
      <div className="flex flex-1 flex-col p-4">
        {/* Brand & Category */}
        <div className="flex items-center justify-between gap-2 text-[11px] text-slate-500 mb-1">
          <span className="font-semibold uppercase tracking-wider text-slate-400 truncate">
            {product.brand}
          </span>
          <span className="text-slate-400 truncate">{product.categoryName}</span>
        </div>

        {/* 2-Line Clamped Product Title */}
        <Link
          href={`/products/${product.slug}`}
          className="text-sm font-bold text-ink-900 group-hover:text-primary-600 transition-colors line-clamp-2 leading-snug min-h-[2.5rem]"
        >
          {product.name}
        </Link>

        {/* Star Rating + Review Count */}
        <div className="mt-1.5">
          <StarRating
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Price Block */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex-1 flex flex-col justify-end">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-lg font-extrabold text-ink-900">
              {formatInr(product.priceInr)}
            </span>
            {product.originalPriceInr &&
              product.originalPriceInr > product.priceInr && (
                <span className="text-xs text-slate-400 line-through">
                  {formatInr(product.originalPriceInr)}
                </span>
              )}
            {discount > 0 && (
              <span className="text-xs font-bold text-success-600">
                {discount}% off
              </span>
            )}
          </div>

          {/* Delivery & Stock Status Row */}
          <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
            {qualifiesFreeDelivery ? (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <Truck className="h-3 w-3 text-primary-600 shrink-0" />
                Free delivery
              </span>
            ) : (
              <span className="text-slate-500">Fast delivery</span>
            )}

            {isOutOfStock ? (
              <span className="font-bold text-danger-600">Out of stock</span>
            ) : isLowStock ? (
              <span className="font-bold text-warning-700">
                Only {product.stockQuantity} left
              </span>
            ) : (
              <span className="font-semibold text-success-700">In stock</span>
            )}
          </div>

          {/* Full-Width Add to Cart / Quantity Stepper */}
          <div className="mt-3.5">
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="w-full rounded-lg bg-slate-100 py-2.5 text-xs font-bold text-slate-400 cursor-not-allowed"
              >
                Currently Unavailable
              </button>
            ) : inCartItem ? (
              <div className="flex items-center justify-between rounded-lg border border-primary-600 bg-primary-50/60 p-1">
                <button
                  type="button"
                  onClick={() => {
                    if (inCartItem.quantity <= 1) {
                      removeItem(product.id);
                      showToast(`Removed "${product.name}" from cart`, "info");
                    } else {
                      updateQuantity(product.id, inCartItem.quantity - 1);
                    }
                  }}
                  aria-label="Decrease quantity in cart"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-ink-800 shadow-sm hover:bg-slate-100 transition"
                >
                  {inCartItem.quantity <= 1 ? (
                    <Trash2 className="h-3.5 w-3.5 text-danger-600" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </button>
                <Link
                  href="/cart"
                  className="text-xs font-extrabold text-primary-700 hover:underline px-2"
                >
                  {inCartItem.quantity} in cart · View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (inCartItem.quantity >= product.stockQuantity) {
                      showToast(
                        `Only ${product.stockQuantity} available`,
                        "info"
                      );
                      return;
                    }
                    updateQuantity(product.id, inCartItem.quantity + 1);
                  }}
                  aria-label="Increase quantity in cart"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-600 text-white shadow-sm hover:bg-primary-700 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 active:scale-[0.99] transition"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
