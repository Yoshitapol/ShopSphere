import React from "react";
import Link from "next/link";
import { PackageSearch, ArrowLeft, ShoppingBag } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16">
      <div className="max-w-md w-full rounded-2xl border border-slate-200/90 bg-white p-8 sm:p-10 text-center shadow-card-hover space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
          <PackageSearch className="h-8 w-8" />
        </div>
        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-slate-100 px-3 py-0.5 text-xs font-bold text-slate-600">
            404 • Page Not Found
          </span>
          <h1 className="text-2xl font-extrabold text-ink-900">
            We couldn&apos;t find that page
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The product or link you followed may have moved or is no longer
            available. Explore our latest deals and top categories below.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-ink-800 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-primary-700 transition"
          >
            <ShoppingBag className="h-4 w-4" />
            Explore Products
          </Link>
        </div>
      </div>
    </div>
  );
}
