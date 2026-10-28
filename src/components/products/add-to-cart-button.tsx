"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Zap, AlertCircle } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useToast } from "@/components/ui/toast-provider";
import type { ProductCatalogItem } from "@/types";

interface AddToCartDetailWidgetProps {
  product: ProductCatalogItem;
}

export function AddToCartDetailWidget({ product }: AddToCartDetailWidgetProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { showToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  const isOutOfStock = product.stockQuantity <= 0 || !product.isAvailable;
  const maxAllowed = Math.min(10, Math.max(1, product.stockQuantity));

  const handleAdd = (redirectToCart = false) => {
    if (isOutOfStock) return;
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
      quantity
    );
    showToast(
      `Added ${quantity} × "${product.name}" to your cart`,
      "success"
    );
    if (redirectToCart) {
      router.push("/cart");
    }
  };

  if (isOutOfStock) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-danger-200 bg-danger-50 p-4 text-sm font-semibold text-danger-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Currently out of stock. Check back soon for restock updates.</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Quantity
        </span>
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 transition"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-10 text-center text-sm font-extrabold text-ink-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
            disabled={quantity >= maxAllowed}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink-700 shadow-xs hover:bg-slate-100 disabled:opacity-40 transition"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        {product.stockQuantity <= product.reorderThreshold && (
          <span className="text-xs font-bold text-warning-700">
            Only {product.stockQuantity} left in stock
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-primary-700 active:scale-[0.99] transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-accent-600 active:scale-[0.99] transition"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
