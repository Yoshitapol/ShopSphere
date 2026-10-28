"use client";

// ============================================================================
// ShopSphere Admin Order Status Selector Component
// Experiment 4 & 14: Order Status Updates via Server Actions
// ============================================================================
import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateOrderStatusServerAction } from "@/actions/order-actions";
import { useToast } from "@/components/ui/toast-provider";
import type { OrderStatus } from "@/types";

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: OrderStatus;
}

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function OrderStatusSelect({
  orderId,
  currentStatus,
}: OrderStatusSelectProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value as OrderStatus;
    startTransition(async () => {
      const res = await updateOrderStatusServerAction(orderId, nextStatus);
      if (res.ok) {
        showToast(res.message, "success");
        router.refresh();
      } else {
        showToast(res.message, "error");
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-2">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={handleStatusChange}
        aria-label="Update order status"
        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none disabled:opacity-50"
      >
        {STATUS_OPTIONS.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
      {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />}
    </div>
  );
}
