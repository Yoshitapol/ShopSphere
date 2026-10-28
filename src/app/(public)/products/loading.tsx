import React from "react";
import { ProductGridSkeleton } from "@/components/ui/storefront-helpers";

export default function ProductsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      <div className="h-5 w-40 rounded bg-slate-200 animate-pulse" />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="hidden lg:block lg:col-span-3 h-[480px] rounded-2xl border border-slate-200 bg-white p-5 animate-pulse" />
        <div className="lg:col-span-9 space-y-4">
          <div className="h-16 rounded-xl border border-slate-200 bg-white animate-pulse" />
          <ProductGridSkeleton count={6} />
        </div>
      </div>
    </div>
  );
}
