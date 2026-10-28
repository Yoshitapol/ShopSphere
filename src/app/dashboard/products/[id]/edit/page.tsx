// ============================================================================
// ShopSphere Admin Edit Product Page (/dashboard/products/[id]/edit)
// Experiment 1: Async Dynamic Route Params
// Experiment 4 & 6: Server Action Update Mutation + Cross-DB Synchronization
// ============================================================================
import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ProductForm } from "@/components/forms/product-form";
import {
  getProductByIdOrSlug,
  listCategories,
} from "@/lib/mongodb/product-service";
import { requireAdminUser } from "@/lib/permissions/rbac";

export const dynamic = "force-dynamic";

interface AdminEditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminEditProductPage({
  params,
}: AdminEditProductPageProps) {
  await requireAdminUser("/dashboard/products");
  const { id } = await params;

  const [product, categories] = await Promise.all([
    getProductByIdOrSlug(id),
    listCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Product Inventory
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
          Edit Product: {product.name}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 font-mono">
          Catalog ID: {product.id} • SKU: {product.sku}
        </p>
      </div>

      <ProductForm
        mode="edit"
        categories={categories}
        initialProduct={product}
      />
    </div>
  );
}
