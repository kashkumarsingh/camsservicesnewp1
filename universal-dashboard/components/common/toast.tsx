"use client";

import type { ReactNode } from "react";
import React, { createContext, useContext, useState, useCallback } from "react";

type ToastVariant = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toasts: Toast[];
  show: (toast: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next: Toast = { id, ...toast };
      setToasts((prev) => [...prev, next]);
      setTimeout(() => dismiss(id), 4500);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toasts, show, dismiss }}>
      {children}
      <div className="pointer-events-none fixed right-3 top-3 z-50 flex max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            type="button"
            onClick={() => dismiss(toast.id)}
            className={`pointer-events-auto flex flex-col rounded-md border px-3 py-2 text-left text-caption shadow-md ${
              toast.variant === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
                : toast.variant === "error"
                  ? "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-100"
                  : toast.variant === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
                    : "border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            }`}
          >
            <span className="font-semibold">{toast.title}</span>
            {toast.description && (
              <span className="mt-0.5 text-micro text-slate-600 dark:text-slate-400">
                {toast.description}
              </span>
            )}
          </button>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

