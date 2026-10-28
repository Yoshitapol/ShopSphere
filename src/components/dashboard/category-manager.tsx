"use client";

// ============================================================================
// ShopSphere Admin Category Manager & Demo Reset Widget
// Experiment 5 & 14: Relational Category Management & Seed Reset
// ============================================================================
import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FolderPlus, RotateCcw, Loader2, Tag } from "lucide-react";
import {
  createCategoryServerAction,
  resetDemoCatalogAction,
} from "@/actions/product-actions";
import { useToast } from "@/components/ui/toast-provider";
import type { CategoryRecord } from "@/types";

interface CategoryManagerProps {
  categories: CategoryRecord[];
}

export function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createCategoryServerAction({
        name,
        description,
        iconName: "Package",
        isActive: true,
      });
      if (res.ok) {
        showToast(res.message, "success");
        setName("");
        setDescription("");
        setIsOpen(false);
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  const handleResetDemo = () => {
    startTransition(async () => {
      const res = await resetDemoCatalogAction();
      if (res.ok) {
        showToast(res.message, "info");
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Tag className="h-4 w-4 text-indigo-600" />
            MySQL Categories ({categories.length})
          </h2>
          <p className="text-xs text-slate-500">
            Relational categories referenced by InventoryItem foreign keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleResetDemo}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Demo Seed Data
          </button>

          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-50 border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition"
          >
            <FolderPlus className="h-3.5 w-3.5" />
            {isOpen ? "Hide Form" : "New Category"}
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
          >
            <span className="font-semibold text-slate-800">{cat.name}</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
              {cat.productCount ?? 0} items
            </span>
          </div>
        ))}
      </div>

      {isOpen && (
        <form
          onSubmit={handleCreateCategory}
          className="grid grid-cols-1 gap-3 sm:grid-cols-12 border-t border-slate-100 pt-4"
        >
          <input
            type="text"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Category Name (e.g., Gaming & Peripherals)"
            className="sm:col-span-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900"
          />
          <input
            type="text"
            required
            minLength={10}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Category description (min 10 chars)..."
            className="sm:col-span-6 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900"
          />
          <button
            type="submit"
            disabled={isPending}
            className="sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              "Create"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
