"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  title: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (title: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback(
    (title: string, variant: ToastVariant = "success") => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, variant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200/90 border-l-4 bg-white px-4 py-3.5 shadow-card-hover transition-all duration-200 ${
              toast.variant === "success"
                ? "border-l-success-600 text-ink-900"
                : toast.variant === "error"
                ? "border-l-danger-600 text-ink-900"
                : "border-l-primary-600 text-ink-900"
            }`}
          >
            {toast.variant === "success" && (
              <CheckCircle2 className="h-5 w-5 text-success-600 shrink-0 mt-0.5" />
            )}
            {toast.variant === "error" && (
              <AlertCircle className="h-5 w-5 text-danger-600 shrink-0 mt-0.5" />
            )}
            {toast.variant === "info" && (
              <Info className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {toast.variant === "success"
                  ? "Success"
                  : toast.variant === "error"
                  ? "Attention"
                  : "Notification"}
              </p>
              <p className="text-sm font-medium text-ink-800 leading-snug mt-0.5">
                {toast.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-ink-700 hover:bg-slate-100 p-1 rounded-lg transition-colors"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
