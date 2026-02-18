'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Users, ChevronDown } from 'lucide-react';

export interface TraineeFilterItem {
  id: number;
  name: string;
}

interface TraineeFilterProps {
  trainees: TraineeFilterItem[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  /** When true, hide the filter when only one trainee. */
  hideWhenSingle?: boolean;
  className?: string;
}

/**
 * Trainee filter dropdown for trainer calendar.
 * Shows "All trainees" or selected trainee name. Matches parent dashboard ChildrenFilter pattern.
 */
export function TraineeFilter({
  trainees: traineeList,
  selectedIds,
  onChange,
  hideWhenSingle = true,
  className = '',
}: TraineeFilterProps) {
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

  if (traineeList.length === 0) return null;
  if (hideWhenSingle && traineeList.length === 1) return null;

  const allSelected = selectedIds.length === 0;
  const selectedId = selectedIds[0] ?? null;

  const toggleTrainee = (id: number) => {
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

  const label = allSelected
    ? 'All trainees'
    : traineeList.find((c) => c.id === selectedId)?.name ?? '1 trainee';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Filter by trainee"
      >
        <Users size={16} className="text-gray-500 dark:text-gray-400 shrink-0" />
        <span>{label}</span>
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
            <span className="font-medium">All trainees</span>
          </button>
          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />
          {traineeList.map((trainee) => {
            const checked = allSelected || selectedIds.includes(trainee.id);
            return (
              <button
                key={trainee.id}
                type="button"
                onClick={() => toggleTrainee(trainee.id)}
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
                <span className="truncate">{trainee.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
