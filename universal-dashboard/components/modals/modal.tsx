"use client";

import type { ReactNode } from "react";
import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  children,
  footer,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center p-0 bg-slate-900/40 sm:items-center sm:p-4"
      aria-modal="true"
      role="dialog"
      onClick={onClose}
    >
      <div
        className="flex w-full max-h-[100dvh] flex-col rounded-t-2xl bg-white text-body shadow-lg dark:bg-slate-900 sm:mx-4 sm:max-h-[90vh] sm:max-w-md sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-2.5 dark:border-slate-700">
          <h2 id="modal-title" className="text-title font-semibold text-slate-900 dark:text-slate-50">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 text-body text-slate-700 dark:text-slate-200">
          {children}
        </div>
        {footer && (
          <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 px-4 py-2.5 dark:border-slate-700">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
};
