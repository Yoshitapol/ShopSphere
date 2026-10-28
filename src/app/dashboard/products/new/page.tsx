import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/forms/product-form";
import { listCategories } from "@/lib/mongodb/product-service";
import { requireAdminUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

export default async function AdminNewProductPage() {
  await requireAdminUser("/dashboard/products/new");
  const categories = await listCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Product Inventory
          </Link>
          <h2 className="text-2xl font-extrabold text-ink-900 mt-1">
            Add New Product
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Publish a new item to the storefront catalog and set its opening warehouse stock.
          </p>
        </div>
      </div>

      <ProductForm mode="create" categories={categories} />
    </div>
  );
}
