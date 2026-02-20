'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/utils/cn';

const POPOVER_WIDTH = 320;
const POPOVER_OFFSET = 8;

export interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onResetAll: () => void;
  hasActiveFilters: boolean;
  activeFilterCount?: number;
  children: React.ReactNode;
  title?: string;
  /** Ref to the Filter button element. When set, panel opens as an anchored popover below the button. */
  triggerRef?: React.RefObject<HTMLElement | null>;
}

/**
 * Filter panel as an anchored popover: opens below/beside the Filter button,
 * floats over content, fixed width ~320px. Closes on Apply now, X, Escape, click outside.
 */
export function FilterPanel({
  isOpen,
  onClose,
  onApply,
  onResetAll,
  hasActiveFilters,
  activeFilterCount = 0,
  children,
  title = 'Filter',
  triggerRef,
}: FilterPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; right: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setPosition(null);
      return;
    }
    if (!triggerRef?.current) {
      setPosition({ top: 16, right: 16 });
      return;
    }
    const el = triggerRef.current;
    const rect = el.getBoundingClientRect();
    setPosition({
      top: rect.bottom + POPOVER_OFFSET,
      right: typeof window !== 'undefined' ? window.innerWidth - rect.right : 0,
    });
  }, [isOpen, triggerRef]);

  useEffect(() => {
    if (!isOpen || !triggerRef?.current) return;
    const updatePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPosition({
        top: rect.bottom + POPOVER_OFFSET,
        right: window.innerWidth - rect.right,
      });
    };
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, triggerRef]);

  const handleApply = () => {
    onApply();
    onClose();
  };

  const showPanel = isOpen && (position !== null || !triggerRef);
  const panelContent = showPanel ? (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className={cn(
        'fixed z-40 flex flex-col bg-white shadow-xl ring-1 ring-slate-200 rounded-2xl dark:ring-slate-700 dark:bg-slate-900',
        'w-[320px] max-h-[85vh] overflow-hidden',
        'transition-opacity duration-150',
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      )}
      style={
        position
          ? { top: position.top, right: position.right, width: POPOVER_WIDTH }
          : { top: 16, right: 16, width: POPOVER_WIDTH }
      }
    >
      <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-slate-500" />
          <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </span>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary-blue px-2 py-0.5 text-2xs font-medium text-white">
              {activeFilterCount}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
          aria-label="Close filters"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4 min-h-0">
        {children}
      </div>

      <div
        className={cn(
          'flex flex-shrink-0 items-center justify-between gap-3 border-t border-slate-200 p-4 dark:border-slate-700'
        )}
      >
        <button
          type="button"
          onClick={onResetAll}
          disabled={!hasActiveFilters}
          className={cn(
            'rounded-md px-3 py-2 text-sm transition-colors',
            hasActiveFilters
              ? 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              : 'cursor-not-allowed text-slate-300 dark:text-slate-600'
          )}
        >
          Reset all
        </button>
        <button
          type="button"
          onClick={handleApply}
          className="h-9 flex-1 rounded-md bg-primary-blue text-sm font-medium text-white transition-colors hover:bg-primary-blue/90"
        >
          Apply now
        </button>
      </div>
    </div>
  ) : null;

  const overlayAndPanel = (
    <>
      {/* Click-outside overlay: transparent, blocks interaction when open */}
      <div
        className={cn(
          'fixed inset-0 z-30 transition-opacity duration-150',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'transparent' }}
        onClick={onClose}
        aria-hidden
      />
      {panelContent}
    </>
  );

  if (isOpen && typeof document !== 'undefined' && document.body) {
    return createPortal(overlayAndPanel, document.body);
  }
  return overlayAndPanel;
}

export interface FilterTriggerButtonProps {
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClick: () => void;
}

/**
 * Toolbar button that opens the filter popover. Blue border when filters active; badge with count.
 * Forward ref so parent can pass triggerRef to FilterPanel for anchoring.
 */
export const FilterTriggerButton = React.forwardRef<HTMLButtonElement, FilterTriggerButtonProps>(
  function FilterTriggerButton({ hasActiveFilters, activeFilterCount, onClick }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        className={cn(
          'flex h-9 items-center gap-2 whitespace-nowrap rounded-md border px-3 text-sm transition-colors',
          hasActiveFilters
            ? 'border-primary-blue bg-blue-50 text-primary-blue hover:bg-blue-100 dark:border-primary-blue dark:bg-primary-blue/10 dark:hover:bg-primary-blue/20'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800'
        )}
      >
        <SlidersHorizontal size={14} />
        <span className="hidden sm:inline">Filter</span>
        {activeFilterCount > 0 && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-blue text-2xs font-medium text-white">
            {activeFilterCount}
          </span>
        )}
      </button>
    );
  }
);
