"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { deleteProductServerAction } from "@/actions/product-actions";
import { useToast } from "@/components/ui/toast-provider";

interface ProductTableActionsProps {
  productId: string;
  productSlug: string;
  productName: string;
}

export function ProductTableActions({
  productId,
  productSlug,
  productName,
}: ProductTableActionsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteProductServerAction(productId);
      setConfirmOpen(false);
      if (res.ok) {
        showToast(res.message, "info");
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-1.5 relative">
      <Link
        href={`/products/${productSlug}`}
        title="View public product page"
        aria-label={`View ${productName} in store`}
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 hover:text-ink-900 transition"
      >
        <ExternalLink className="h-3.5 w-3.5" />
      </Link>

      <Link
        href={`/dashboard/products/${productId}/edit`}
        className="inline-flex items-center gap-1 rounded-lg border border-primary-200 bg-primary-50 px-2.5 py-1 text-xs font-bold text-primary-700 hover:bg-primary-100 transition"
      >
        <Pencil className="h-3.5 w-3.5" />
        Edit
      </Link>

      {!confirmOpen ? (
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg border border-danger-200 bg-danger-50 px-2.5 py-1 text-xs font-bold text-danger-700 hover:bg-danger-100 transition"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      ) : (
        <div className="flex items-center gap-1 rounded-lg border border-danger-300 bg-danger-50 px-2 py-1">
          <span className="text-[11px] font-bold text-danger-800 mr-1">
            Confirm?
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={handleDelete}
            aria-label={`Confirm delete ${productName}`}
            className="rounded bg-danger-600 px-2 py-0.5 text-[11px] font-bold text-white hover:bg-danger-700 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Yes"}
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => setConfirmOpen(false)}
            className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-600 hover:bg-slate-100"
          >
            No
          </button>
        </div>
      )}
    </div>
  );
}
