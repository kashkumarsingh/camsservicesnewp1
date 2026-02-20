'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Shared search input for FilterBar. Always h-9, left side of FilterBar.
 * Clear button (X) when value is non-empty.
 */
export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}: SearchInputProps) {
  return (
    <div
      className={`relative flex h-9 min-w-[200px] max-w-[320px] flex-1 items-center rounded-md border border-slate-200 bg-white pl-8 pr-8 text-sm text-slate-900 focus-within:ring-1 focus-within:ring-primary-blue focus-within:border-primary-blue dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50 ${className}`.trim()}
    >
      <Search className="pointer-events-none absolute left-2.5 h-[15px] w-[15px] shrink-0 text-slate-400" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
        aria-label="Search"
      />
      {value !== '' && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors dark:hover:bg-slate-700 dark:hover:text-slate-300"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
