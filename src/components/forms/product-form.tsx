"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Save,
  Plus,
  Trash2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  createProductServerAction,
  updateProductServerAction,
} from "@/actions/product-actions";
import { useToast } from "@/components/ui/toast-provider";
import { ProductImage } from "@/components/ui/product-image";
import type {
  CategoryRecord,
  ProductCatalogItem,
  ProductSpecification,
} from "@/types";

interface ProductFormProps {
  mode: "create" | "edit";
  categories: CategoryRecord[];
  initialProduct?: ProductCatalogItem;
}

export function ProductForm({
  mode,
  categories,
  initialProduct,
}: ProductFormProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [slug, setSlug] = useState(initialProduct?.slug ?? "");
  const [sku, setSku] = useState(initialProduct?.sku ?? "");
  const [shortDescription, setShortDescription] = useState(
    initialProduct?.shortDescription ?? ""
  );
  const [description, setDescription] = useState(
    initialProduct?.description ?? ""
  );
  const [priceInr, setPriceInr] = useState(
    initialProduct ? String(initialProduct.priceInr) : ""
  );
  const [originalPriceInr, setOriginalPriceInr] = useState(
    initialProduct?.originalPriceInr
      ? String(initialProduct.originalPriceInr)
      : ""
  );
  const [categoryId, setCategoryId] = useState(
    initialProduct?.categoryId ?? categories[0]?.id ?? "cat_audio"
  );
  const [stockQuantity, setStockQuantity] = useState(
    initialProduct ? String(initialProduct.stockQuantity) : "15"
  );
  const [reorderThreshold, setReorderThreshold] = useState(
    initialProduct ? String(initialProduct.reorderThreshold) : "5"
  );
  const [brand, setBrand] = useState(
    initialProduct?.brand ?? "ShopSphere Originals"
  );
  const [warranty, setWarranty] = useState(
    initialProduct?.warranty ?? "1 Year Manufacturer Warranty"
  );
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);
  const [tagsInput, setTagsInput] = useState(
    initialProduct?.tags.join(", ") ?? "wireless, premium, bestseller"
  );
  const [imageUrl, setImageUrl] = useState(
    initialProduct?.images[0] ??
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80"
  );
  const [specifications, setSpecifications] = useState<ProductSpecification[]>(
    initialProduct?.specifications && initialProduct.specifications.length > 0
      ? initialProduct.specifications
      : [
          { label: "Connectivity", value: "Bluetooth 5.4 / USB Type-C" },
          { label: "Warranty Coverage", value: "1 Year India Doorstep Service" },
        ]
  );

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (
    idx: number,
    key: "label" | "value",
    val: string
  ) => {
    setSpecifications((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [key]: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});
    setSuccessMessage(null);

    const parsedTags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const validSpecs = specifications.filter(
      (s) => s.label.trim() !== "" && s.value.trim() !== ""
    );

    const payload = {
      name,
      slug: slug.trim() || undefined,
      sku,
      shortDescription,
      description,
      priceInr: Number(priceInr),
      originalPriceInr: originalPriceInr ? Number(originalPriceInr) : null,
      images: [imageUrl.trim()],
      categoryId,
      tags: parsedTags,
      specifications: validSpecs,
      stockQuantity: Number(stockQuantity),
      reorderThreshold: Number(reorderThreshold),
      brand,
      warranty,
      featured,
    };

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createProductServerAction(payload)
          : await updateProductServerAction(initialProduct!.id, payload);

      if (!result.ok) {
        setErrorMessage(result.message);
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors);
        }
        showToast(result.message, "error");
        return;
      }

      setSuccessMessage(result.message);
      showToast(result.message, "success");
      router.push("/dashboard/products");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
          <AlertCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Please check the form fields</p>
            <p className="mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-success-200 bg-success-50 p-4 text-sm text-success-800">
          <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
          <p className="font-semibold">{successMessage}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Core Product Identity */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-ink-900">
              1. Product Information
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., AetherSonic Studio Pro Monitor Headphones"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-danger-600">
                    {fieldErrors.name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  SKU Code (Unique) *
                </label>
                <input
                  type="text"
                  required
                  value={sku}
                  onChange={(e) => setSku(e.target.value.toUpperCase())}
                  placeholder="e.g., SPH-AUD-099"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-mono text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.sku && (
                  <p className="mt-1 text-xs text-danger-600">
                    {fieldErrors.sku[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  URL Slug (Auto-generated if blank)
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g., aethersonic-studio-pro"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.slug && (
                  <p className="mt-1 text-xs text-danger-600">
                    {fieldErrors.slug[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Short Highlights *
                </label>
                <input
                  type="text"
                  required
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Concise 1-2 sentence highlight of key features..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.shortDescription && (
                  <p className="mt-1 text-xs text-danger-600">
                    {fieldErrors.shortDescription[0]}
                  </p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Full overview, build quality, and use cases..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-ink-900 focus:border-primary-500 focus:bg-white"
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-danger-600">
                    {fieldErrors.description[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Card 2: Technical Specifications */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-ink-900">
                  2. Technical Specifications
                </h2>
                <p className="text-xs text-slate-500">
                  Displayed in the product detail specifications table.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddSpec}
                className="inline-flex items-center gap-1.5 rounded-xl border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-bold text-primary-700 hover:bg-primary-100 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Spec Row
              </button>
            </div>

            <div className="space-y-2.5">
              {specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <input
                    type="text"
                    value={spec.label}
                    onChange={(e) =>
                      handleSpecChange(idx, "label", e.target.value)
                    }
                    placeholder="Label (e.g., Driver Size)"
                    className="sm:col-span-5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-ink-900"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) =>
                      handleSpecChange(idx, "value", e.target.value)
                    }
                    placeholder="Value (e.g., 40mm Neodymium)"
                    className="sm:col-span-6 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-ink-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="sm:col-span-1 inline-flex items-center justify-center rounded-xl p-2 text-slate-400 hover:bg-danger-50 hover:text-danger-600"
                    aria-label="Remove specification"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column: Pricing, Stock & Image */}
        <div className="space-y-6">
          {/* Card 3: Pricing & Stock */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-4">
            <h2 className="text-base font-extrabold text-ink-900">
              3. Pricing (₹ INR) &amp; Inventory
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Selling Price (₹ INR) *
              </label>
              <input
                type="number"
                min="1"
                required
                value={priceInr}
                onChange={(e) => setPriceInr(e.target.value)}
                placeholder="14999"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-ink-900"
              />
              {fieldErrors.priceInr && (
                <p className="mt-1 text-xs text-danger-600">
                  {fieldErrors.priceInr[0]}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                MRP (₹ INR, Optional)
              </label>
              <input
                type="number"
                min="1"
                value={originalPriceInr}
                onChange={(e) => setOriginalPriceInr(e.target.value)}
                placeholder="18999"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-ink-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                Store Department *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-ink-900"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-ink-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Low-Stock Alert
                </label>
                <input
                  type="number"
                  min="0"
                  value={reorderThreshold}
                  onChange={(e) => setReorderThreshold(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Brand
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Warranty
                </label>
                <input
                  type="text"
                  value={warranty}
                  onChange={(e) => setWarranty(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-ink-900"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Search Tags (Comma separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-ink-900"
                />
              </div>
            </div>

            <label className="flex items-center gap-2.5 pt-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-xs font-bold text-ink-800">
                Feature in Deals of the Day
              </span>
            </label>
          </div>

          {/* Card 4: Image Preview */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-card space-y-3">
            <h2 className="text-base font-extrabold text-ink-900">
              4. Product Image URL
            </h2>
            <input
              type="url"
              required
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-ink-900"
            />
            {fieldErrors.images && (
              <p className="text-xs text-danger-600">{fieldErrors.images[0]}</p>
            )}
            <div className="aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-4">
              <ProductImage
                src={imageUrl}
                alt={name || "Product Preview"}
                fit="contain"
                className="h-full w-full"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-ink-700 hover:bg-slate-100 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-primary-700 disabled:opacity-60 transition"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {mode === "create" ? "Publish Product" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
