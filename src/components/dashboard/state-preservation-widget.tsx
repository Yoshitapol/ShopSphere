"use client";

// ============================================================================
// ShopSphere Layout State-Preservation Demonstration Widget
// Experiment 3: Root Layouts, Nested Layouts & State Preservation Across Sibling Routes
// Mounted inside src/app/dashboard/layout.tsx — retains React state when navigating
// between /dashboard, /dashboard/products, /dashboard/products/new, and /dashboard/orders.
// ============================================================================
import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Layers, Plus, Minus, RotateCcw, StickyNote } from "lucide-react";

export function DashboardStatePreservationWidget() {
  const pathname = usePathname();
  const [auditCount, setAuditCount] = useState<number>(1);
  const [scratchpadNote, setScratchpadNote] = useState<string>(
    "Restock BaristaCraft Espresso (< 5 left)"
  );
  const [routeHopCount, setRouteHopCount] = useState<number>(0);
  const previousPathRef = useRef<string>(pathname);

  useEffect(() => {
    if (previousPathRef.current !== pathname) {
      previousPathRef.current = pathname;
      setRouteHopCount((c) => c + 1);
    }
  }, [pathname]);

  return (
    <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-slate-800 space-y-2.5">
      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
          <Layers className="h-3.5 w-3.5" />
          Exp 3: Layout State
        </span>
        <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
          Hops: {routeHopCount}
        </span>
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed">
        Mounted in <code className="font-mono text-indigo-700">dashboard/layout.tsx</code>.
        Navigate between sibling links above — this counter &amp; note never remount!
      </p>

      {/* Audit Counter */}
      <div className="flex items-center justify-between rounded-xl border border-indigo-200/80 bg-white px-2.5 py-1.5">
        <span className="text-xs font-semibold text-slate-700">
          Audit Counter:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAuditCount((c) => c - 1)}
            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-100"
            aria-label="Decrement audit counter"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[28px] text-center text-xs font-extrabold text-indigo-700">
            {auditCount}
          </span>
          <button
            type="button"
            onClick={() => setAuditCount((c) => c + 1)}
            className="rounded-lg border border-slate-200 p-1 text-slate-600 hover:bg-slate-100"
            aria-label="Increment audit counter"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setAuditCount(0)}
            className="rounded-lg border border-slate-200 p-1 text-slate-400 hover:text-slate-700"
            title="Reset counter"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Persistent Scratchpad Input */}
      <div className="space-y-1">
        <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          <StickyNote className="h-3 w-3 text-indigo-600" />
          Session Scratchpad
        </label>
        <input
          type="text"
          value={scratchpadNote}
          onChange={(e) => setScratchpadNote(e.target.value)}
          placeholder="Type a note and switch routes..."
          className="w-full rounded-lg border border-indigo-200 bg-white px-2.5 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
