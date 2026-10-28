"use client";

import React, { useState } from "react";
import { ShoppingBag } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fit?: "cover" | "contain";
}

export function ProductImage({
  src,
  alt,
  className = "",
  fit = "cover",
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-primary-50/60 text-slate-500 p-4 text-center select-none ${className}`}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200/80 mb-2">
          <ShoppingBag className="h-6 w-6 text-primary-500 opacity-85" />
        </div>
        <span className="text-[11px] font-medium text-slate-500 line-clamp-2 max-w-[160px]">
          {alt || "ShopSphere Product"}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${fit === "contain" ? "object-contain" : "object-cover"} ${className}`}
    />
  );
}
