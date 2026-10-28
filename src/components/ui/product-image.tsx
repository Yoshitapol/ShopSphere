"use client";

// ============================================================================
// ShopSphere Resilient Product Image Component with Automatic Fallback
// Experiment 2: Broken Images Have Sensible Fallbacks
// ============================================================================
import React, { useState } from "react";
import { Package } from "lucide-react";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
}

export function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-indigo-50/70 text-indigo-700 p-4 text-center select-none ${className}`}
      >
        <Package className="h-10 w-10 text-indigo-500 mb-2 opacity-80" />
        <span className="text-xs font-medium text-slate-600 line-clamp-2 max-w-[180px]">
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
      className={`object-cover ${className}`}
    />
  );
}
