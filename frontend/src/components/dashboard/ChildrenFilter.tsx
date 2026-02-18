'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown } from 'lucide-react';
import { getChildColor } from '@/utils/childColorUtils';

export interface ChildFilterItem {
  id: number;
  name: string;
  /** Hours remaining for this child (from active package). Shown in dropdown and trigger. */
  remainingHours?: number;
}

interface ChildrenFilterProps {
  children: ChildFilterItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /** When true, hide the filter (e.g. when only one child). */
  hideWhenSingle?: boolean;
  className?: string;
  /** Child IDs with no hours (new – first purchase). Shown as "New children (N)" option. */
  newChildIds?: number[];
  /** Child IDs who ran out of hours (expired). Shown as "Expired (N)" option. */
  expiredChildIds?: number[];
}

/**
 * Children filter dropdown for calendar controls.
 * Shows "All Children" or "N Children" and allows multi-select by child.
 * Used in parent dashboard calendar header.
 */
function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const setA = new Set(a);
  return b.every((id) => setA.has(id));
}

export function ChildrenFilter({
  children: childList,
  selectedIds,
  onChange,
  hideWhenSingle = true,
  className = '',
  newChildIds = [],
  expiredChildIds = [],
}: ChildrenFilterProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (childList.length === 0) return null;
  if (hideWhenSingle && childList.length === 1) return null;

  // Treat this as a single-select filter:
  // []     => All children
  // [id]   => Only that child
  // same as newChildIds => "New children"
  // same as expiredChildIds => "Expired"
  const allSelected = selectedIds.length === 0;
  const selectedId = selectedIds[0] ?? null;
  const isNewFilter = newChildIds.length > 0 && sameSet(selectedIds, newChildIds);
  const isExpiredFilter = expiredChildIds.length > 0 && sameSet(selectedIds, expiredChildIds);

  const toggleChild = (id: number) => {
    if (selectedId === id) {
      onChange([]);
      return;
    }
    onChange([id]);
  };

  const selectAll = () => {
    onChange([]);
    setOpen(false);
  };

  const selectNew = () => {
    onChange([...newChildIds]);
    setOpen(false);
  };

  const selectExpired = () => {
    onChange([...expiredChildIds]);
    setOpen(false);
  };

  const selectedChild = selectedIds.length === 1 ? childList.find((c) => c.id === selectedId) : null;
  const hoursLabel = (hours: number | undefined) =>
    hours !== undefined && hours !== null ? ` (${hours.toFixed(1)}h left)` : '';
  const label = allSelected
    ? `All Children (${childList.length})`
    : isNewFilter
      ? `New children (${newChildIds.length})`
      : isExpiredFilter
        ? `Expired (${expiredChildIds.length})`
        : selectedChild
          ? `${selectedChild.name}${hoursLabel(selectedChild.remainingHours)}`
          : `${selectedIds.length} Children`;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter schedule by child. Currently: ${label}`}
      >
        <Users size={16} className="text-gray-500 dark:text-gray-400 shrink-0" aria-hidden />
        <span>Show: {label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-1 min-w-[180px] rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1 z-50"
        >
          <button
            type="button"
            onClick={selectAll}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border ${
                allSelected
                  ? 'bg-indigo-600 border-indigo-600'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              {allSelected && (
                <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              )}
            </span>
            <span className="font-medium">All Children ({childList.length})</span>
          </button>
          {newChildIds.length > 0 && (
            <button
              type="button"
              onClick={selectNew}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  isNewFilter ? 'bg-blue-600 border-blue-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {isNewFilter && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </span>
              <span className="font-medium">New children ({newChildIds.length})</span>
              <span aria-hidden className="text-blue-600 dark:text-blue-400">🆕</span>
            </button>
          )}
          {expiredChildIds.length > 0 && (
            <button
              type="button"
              onClick={selectExpired}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span
                className={`flex h-4 w-4 items-center justify-center rounded border ${
                  isExpiredFilter ? 'bg-red-600 border-red-600' : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {isExpiredFilter && (
                  <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                    <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                )}
              </span>
              <span className="font-medium">Expired ({expiredChildIds.length})</span>
              <span aria-hidden className="text-red-600 dark:text-red-400">🔴</span>
            </button>
          )}
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          {childList.map((child) => {
            const checked =
              allSelected || selectedIds.includes(child.id);
            const color = getChildColor(child.id);
            return (
              <button
                key={child.id}
                type="button"
                onClick={() => toggleChild(child.id)}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border ${
                    checked
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {checked && (
                    <svg className="h-2.5 w-2.5 text-white" fill="currentColor" viewBox="0 0 12 12">
                      <path d="M10 3L4.5 8.5 2 6" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </span>
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
                <span className="truncate flex-1 min-w-0">{child.name}</span>
                {child.remainingHours !== undefined && child.remainingHours !== null && (
                  <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                    {child.remainingHours.toFixed(1)}h left
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
