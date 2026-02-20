'use client';

import React from 'react';

export interface FilterSelectOption {
  label: string;
  value: string;
}

export interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterSelectOption[];
  /** Label for the empty/default option when options do not include it. */
  placeholder?: string;
  /** Value treated as "no filter" for active state styling (e.g. '' or 'all'). */
  defaultValue?: string;
  /** Use "panel" inside FilterPanel (w-full, h-10). */
  size?: 'default' | 'panel';
  className?: string;
}

/**
 * Shared filter select for FilterBar. Always h-9, min-w-[140px].
 * Active (non-default value) shows blue border.
 */
export function FilterSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  defaultValue = '',
  size = 'default',
  className = '',
}: FilterSelectProps) {
  const isActive = value !== defaultValue && value !== '';
  const sizeClasses = size === 'panel' ? 'h-10 w-full' : 'h-9 min-w-[140px]';
  const selectClasses = [
    sizeClasses,
    'cursor-pointer rounded-md border bg-white pl-3 pr-8 text-sm text-slate-900',
    'focus:outline-none focus:ring-1 focus:ring-primary-blue focus:border-primary-blue',
    'dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50',
    isActive ? 'border-primary-blue ring-1 ring-primary-blue' : 'border-slate-200',
  ].join(' ');

  return (
    <div className={className.trim() || undefined}>
      {label !== '' && (
        <label className="mb-0.5 block text-2xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectClasses}
        aria-label={label}
      >
        {placeholder != null && placeholder !== '' && (
          <option value={defaultValue}>{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
