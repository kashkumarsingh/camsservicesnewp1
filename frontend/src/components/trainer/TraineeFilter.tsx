'use client';

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Users, ChevronDown } from 'lucide-react';

const POPOVER_OFFSET = 8;
const VIEWPORT_PADDING = 16;
const MIN_PANEL_WIDTH = 180;
const MIN_SPACE_BELOW = 200;

type PanelPosition = {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
  minWidth: number;
};

function getClampedPosition(triggerRect: DOMRect): PanelPosition {
  if (typeof window === 'undefined') {
    return { top: VIEWPORT_PADDING, right: VIEWPORT_PADDING, minWidth: MIN_PANEL_WIDTH };
  }
  const { innerWidth, innerHeight } = window;
  const minWidth = Math.min(MIN_PANEL_WIDTH, innerWidth - 2 * VIEWPORT_PADDING);

  const panelLeftPreferred = triggerRect.right - MIN_PANEL_WIDTH;
  const panelRightPreferred = triggerRect.right;

  let left: number | undefined;
  let right: number | undefined;
  if (panelLeftPreferred < VIEWPORT_PADDING) {
    left = VIEWPORT_PADDING;
  } else if (panelRightPreferred > innerWidth - VIEWPORT_PADDING) {
    right = VIEWPORT_PADDING;
  } else {
    right = innerWidth - triggerRect.right;
  }

  const spaceBelow = innerHeight - (triggerRect.bottom + POPOVER_OFFSET);
  const showAbove = spaceBelow < MIN_SPACE_BELOW && triggerRect.top > spaceBelow;

  if (showAbove) {
    return {
      bottom: innerHeight - triggerRect.top + POPOVER_OFFSET,
      left,
      right,
      minWidth,
    };
  }
  const top = triggerRect.bottom + POPOVER_OFFSET;
  const maxTop = innerHeight - VIEWPORT_PADDING - 150;
  const clampedTop = Math.min(top, maxTop);
  return { top: clampedTop, left, right, minWidth };
}

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
 * Trainee filter popover for trainer dashboard and schedule.
 * Same anchored popover pattern as ChildrenFilter: fixed overlay + positioned panel portaled to body.
 * Viewport-aware: stays on-screen on tablet and mobile (clamp + flip above when needed).
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
  const [position, setPosition] = useState<PanelPosition | null>(null);

  useLayoutEffect(() => {
    if (!open || !dropdownRef.current) {
      setPosition(null);
      return;
    }
    const update = () => {
      const el = dropdownRef.current;
      if (!el) return;
      setPosition(getClampedPosition(el.getBoundingClientRect()));
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open]);

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
        className="flex min-h-[44px] sm:min-h-0 items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`Filter by trainee. Currently: ${label}`}
      >
        <Users size={16} className="text-gray-500 dark:text-gray-400 shrink-0" aria-hidden />
        <span className="truncate">{label}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && typeof document !== 'undefined' && position && createPortal(
        <>
          <div className="fixed inset-0 z-dropdown" aria-hidden onClick={() => setOpen(false)} />
          <div
            role="listbox"
            className="fixed z-dropdown max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg py-1"
            style={{
              top: position.top,
              bottom: position.bottom,
              left: position.left,
              right: position.right,
              minWidth: position.minWidth,
            }}
            aria-label={`Filter by trainee. Currently: ${label}`}
          >
            <button
              type="button"
              onClick={selectAll}
              className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
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
                  className="w-full flex items-center gap-2 px-3 py-2.5 min-h-[44px] sm:min-h-0 sm:py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
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
        </>,
        document.body
      )}
    </div>
  );
}
