'use client';

import React, { useEffect } from 'react';
import { ChevronLeft, X } from 'lucide-react';

interface SideCanvasProps {
  /** Whether the panel is visible */
  isOpen: boolean;
  /** Called when the user clicks the close button or backdrop */
  onClose: () => void;
  /** Title shown in the header */
  title: string;
  /** Optional description below the title */
  description?: string;
  /** Optional fixed width (Tailwind max-w class or px); defaults to sm / md depending on breakpoint */
  widthClassName?: string;
  /** Optional aria-label override for the close button */
  closeLabel?: string;
  /** Whether to show "Close" text next to the icon (default true for discoverability) */
  showCloseText?: boolean;
  /** Optional footer content (e.g. Update / Cancel) – always visible at bottom */
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * SideCanvas
 *
 * A reusable right-hand slide-over panel (side canvas) for dashboards.
 * - Uses a semi-opaque backdrop to focus attention
 * - Accessible: focus trap can be layered on later; for now we provide correct
 *   aria roles and labels and ensure keyboard users can close the panel.
 * - Default width is tuned for detail views (e.g. "day summary", "session details").
 */
export function SideCanvas({
  isOpen,
  onClose,
  title,
  description,
  widthClassName,
  closeLabel = 'Close panel',
  showCloseText = true,
  footer,
  children,
}: SideCanvasProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const hasFooter = Boolean(footer);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end"
      aria-modal="true"
      role="dialog"
      aria-label={title}
    >
      {/* Backdrop */}
      <button
        type="button"
        className="flex-1 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close backdrop"
      />

      {/* Panel */}
      <div
        className={`relative flex h-full flex-col bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 w-full sm:w-[380px] md:w-[420px] ${widthClassName ?? ''}`}
      >
        <div className="flex shrink-0 items-start justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h2>
            {description && (
              <p className="mt-0.5 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label={closeLabel}
          >
            {showCloseText ? (
              <>
                <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Close</span>
              </>
            ) : (
              <X className="h-4 w-4 shrink-0" aria-hidden="true" />
            )}
          </button>
        </div>
        <div
          className={
            hasFooter
              ? 'min-h-0 flex-1 overflow-y-auto px-4 sm:px-5 py-3 sm:py-4'
              : 'h-[calc(100%-3.25rem)] sm:h-[calc(100%-3.5rem)] overflow-y-auto px-4 sm:px-5 py-3 sm:py-4'
          }
        >
          {children}
        </div>
        {hasFooter && (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-4 sm:px-5 py-3 dark:border-gray-800 dark:bg-gray-900/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default SideCanvas;

