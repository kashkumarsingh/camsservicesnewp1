'use client';

import React from 'react';

export interface FilterSectionProps {
  title: string;
  onReset?: () => void;
  isActive?: boolean;
  children: React.ReactNode;
}

/**
 * A filter group inside FilterPanel. Optional Reset link when section has an active value.
 */
export function FilterSection({
  title,
  onReset,
  isActive = false,
  children,
}: FilterSectionProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {title}
        </span>
        {onReset != null && isActive && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs text-teal-600 hover:text-teal-700 transition-colors dark:text-teal-400 dark:hover:text-teal-300"
          >
            Reset
          </button>
        )}
      </div>
      {children}
    </div>
  );
}
