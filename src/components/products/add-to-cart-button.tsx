"use client";

// ============================================================================
// ShopSphere Product Detail Quantity Selector & Add-to-Cart Client Widget
// Experiment 1 & 2: Interactive Client Component Inside Server Detail Page
// ============================================================================
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Zap } from "lucide-react";
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
      `Added ${quantity} × "${product.name}" to your shopping cart`,
      "success"
    );
    if (redirectToCart) {
      router.push("/cart");
    }
  };

  if (isOutOfStock) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700">
        This item is currently out of stock in the relational inventory. Check
        back soon!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
          Quantity
        </span>
        <div className="inline-flex items-center rounded-xl border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-slate-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxAllowed, q + 1))}
            disabled={quantity >= maxAllowed}
            className="p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <span className="text-xs text-slate-500">
          ({product.stockQuantity} units available in warehouse)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleAdd(false)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
        <button
          type="button"
          onClick={() => handleAdd(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-indigo-600 bg-white px-5 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-50 transition"
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </button>
      </div>
    </div>
  );
}
