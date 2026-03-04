'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

/** Collects focusable elements inside a container (buttons, links, inputs with no disabled/hidden). */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter(
    (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
  );
}

/**
 * SideCanvas
 *
 * A reusable right-hand slide-over panel (side canvas) for dashboards.
 * - Uses a semi-opaque backdrop; z-overlay + z-sidePanel so it sits above header (Tier 3 > Tier 2).
 * - Focus is trapped inside the panel when open so the trigger/focused element behind is not visible or interactive.
 * - Accessible: focus trap, Escape to close, correct aria roles and labels.
 * - When opened, scrolls the content area to top so content is in view.
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
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Scroll content to top when panel opens so content is in view
  useEffect(() => {
    if (!isOpen) return;
    const content = contentRef.current;
    if (content) content.scrollTop = 0;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: when open, move focus into the panel and keep it there; restore on close
  useEffect(() => {
    if (!isOpen) return;
    previousActiveElement.current = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = getFocusableElements(panel);
    const first = focusables[0];
    if (first) {
      first.focus();
    }
    return () => {
      if (previousActiveElement.current && typeof previousActiveElement.current.focus === 'function') {
        previousActiveElement.current.focus();
      }
      previousActiveElement.current = null;
    };
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key !== 'Tab' || !panelRef.current) return;
      const focusables = getFocusableElements(panelRef.current);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const current = document.activeElement as HTMLElement;
      if (e.shiftKey) {
        if (current === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (current === last) {
          e.preventDefault();
          first.focus();
        }
      }
    },
    []
  );

  if (!isOpen) return null;

  const hasFooter = Boolean(footer);

  const panel = (
    <>
      {/* Backdrop – z-overlay (above header); click closes */}
      <button
        type="button"
        className="fixed inset-0 z-overlay cursor-default bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close backdrop"
        tabIndex={-1}
      />

      {/* Panel – z-sidePanel (above overlay); mobile: bottom sheet (flex-col justify-end); md+: right panel */}
      <div
        className="pointer-events-none fixed inset-0 z-sidePanel flex flex-col justify-end md:flex-row md:justify-end"
        aria-modal="true"
        role="dialog"
        aria-label={title}
      >
        <div
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
          className={`pointer-events-auto flex max-h-[90vh] w-full flex-col overflow-hidden border-l border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900
            rounded-t-2xl border-t md:max-h-screen md:rounded-none md:border-t-0
            md:w-[420px] md:max-w-[80vw] lg:w-[480px] xl:w-[520px] ${widthClassName ?? ''}`}
        >
        {/* Mobile: drag handle (visual only) */}
        <div className="flex shrink-0 justify-center pt-3 md:hidden">
          <div className="h-1 w-12 shrink-0 rounded-full bg-slate-300 dark:bg-slate-600" aria-hidden />
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 md:px-6 md:py-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100 md:text-lg">
              {title}
            </h2>
            {description && (
              <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:min-h-0 md:min-w-0"
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
          ref={contentRef}
          className={
            hasFooter
              ? 'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-3 md:px-6 md:py-4'
              : 'min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-4 py-3 md:px-6 md:py-4'
          }
        >
          {children}
        </div>
        {hasFooter && (
          <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:px-6 md:py-4">
            {footer}
          </div>
        )}
        </div>
      </div>
    </>
  );

  return typeof document !== 'undefined' ? createPortal(panel, document.body) : null;
}

export default SideCanvas;

