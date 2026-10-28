// ============================================================================
// ShopSphere Custom 404 Not Found Page
// Experiment 1 & 2: Clean Empty/Error States
// ============================================================================
import React from "react";
import Link from "next/link";
import { PackageSearch, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <PackageSearch className="h-7 w-7" />
        </div>
        <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600">
          HTTP 404 • Resource Not Found
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900">
          Page or Product Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          The requested URL, product slug, or order identifier does not exist or
          may have been removed from the catalog.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
          >
            Browse Catalog
          </Link>
        </div>
      </div>
    </div>
  );
}
