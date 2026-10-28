"use client";

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
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5 text-slate-200 space-y-2.5">
      <div className="flex items-center justify-between gap-1">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary-300">
          <Layers className="h-3.5 w-3.5" />
          Quick Notes &amp; Counter
        </span>
        <span className="rounded-md bg-primary-600/40 border border-primary-400/30 px-1.5 py-0.5 text-[10px] font-bold text-primary-200">
          Views: {routeHopCount}
        </span>
      </div>

      {/* Audit Counter */}
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/80 px-2.5 py-1.5">
        <span className="text-xs font-semibold text-slate-300">
          Batch Counter:
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setAuditCount((c) => c - 1)}
            className="rounded-lg border border-white/10 p-1 text-slate-300 hover:bg-white/10"
            aria-label="Decrement audit counter"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="min-w-[28px] text-center text-xs font-extrabold text-white">
            {auditCount}
          </span>
          <button
            type="button"
            onClick={() => setAuditCount((c) => c + 1)}
            className="rounded-lg border border-white/10 p-1 text-slate-300 hover:bg-white/10"
            aria-label="Increment audit counter"
          >
            <Plus className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setAuditCount(0)}
            className="rounded-lg border border-white/10 p-1 text-slate-400 hover:text-white"
            title="Reset counter"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Persistent Scratchpad Input */}
      <div className="space-y-1">
        <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          <StickyNote className="h-3 w-3 text-accent-400" />
          Shift Scratchpad
        </label>
        <input
          type="text"
          value={scratchpadNote}
          onChange={(e) => setScratchpadNote(e.target.value)}
          placeholder="Add a quick shift note..."
          className="w-full rounded-lg border border-white/10 bg-ink-900/90 px-2.5 py-1.5 text-xs text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
