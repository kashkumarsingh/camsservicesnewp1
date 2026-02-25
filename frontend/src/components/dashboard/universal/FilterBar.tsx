'use client';

import React from 'react';
import { X } from 'lucide-react';

export interface FilterBarProps {
  /** Search input — always leftmost. Rendered in a slot with flex-1 min-w-[200px] max-w-[320px]. */
  searchSlot?: React.ReactNode;
  /** Clear all filters (including URL params when applicable). */
  onClear: () => void;
  /** True when any filter has a non-default value. */
  hasActiveFilters: boolean;
  /** Number of active filters (for badge on Clear button). */
  activeFilterCount?: number;
  /** Filter controls (FilterSelect, etc.). */
  children?: React.ReactNode;
  className?: string;
  /** Optional: when set, filter content is collapsible and only shown when true. */
  isOpen?: boolean;
  /** Optional: called to toggle isOpen (used with collapsible filter bar). */
  onToggle?: () => void;
  /** Optional: grid class for the filter controls wrapper (e.g. grid grid-cols-1 sm:grid-cols-2). */
  gridClassName?: string;
}

/**
 * Always-visible inline filter row. No toggle, no collapse, no modal behaviour.
 * Position: between PageHeader and DataTable. Search lives in searchSlot (left).
 */
export function FilterBar({
  searchSlot,
  onClear,
  hasActiveFilters,
  activeFilterCount = 0,
  children,
  className = '',
  isOpen,
  onToggle,
  gridClassName,
}: FilterBarProps) {
  const base =
    'flex flex-wrap gap-3 items-end p-3 bg-slate-50 border border-slate-200 rounded-card mb-4 dark:bg-slate-900/50 dark:border-slate-700';
  const combined = className.trim() ? `${base} ${className}` : base;
  const showFilters = isOpen !== false;

  return (
    <div className={combined}>
      {searchSlot != null && (
        <div className="flex min-w-[200px] max-w-[320px] flex-1 items-end">
          {searchSlot}
        </div>
      )}

      {onToggle != null && (
        <button
          type="button"
          onClick={onToggle}
          className="h-9 rounded-md border border-slate-200 px-3 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {showFilters ? 'Hide filters' : 'Filters'}
        </button>
      )}

      {children != null && showFilters && (
        <div className={gridClassName != null ? gridClassName : 'flex flex-1 flex-wrap items-end gap-3'}>
          {children}
        </div>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="flex h-9 items-center gap-1.5 whitespace-nowrap rounded-md border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          <X size={13} aria-hidden />
          Clear filters
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-700 dark:bg-slate-600 dark:text-slate-200">
              {activeFilterCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
}
