'use client';

import React, { useState, useCallback } from 'react';
import { FileText, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import moment from 'moment';

/** Number of session notes shown initially before "Show more". */
const INITIAL_VISIBLE_COUNT = 5;

/** Max height of the scrollable list when expanded (20+ items). */
const EXPANDED_LIST_MAX_HEIGHT = '280px';

export interface SessionNoteItem {
  scheduleId: string;
  date: string;
  childName: string;
  childId: number;
  noteSnippet?: string;
  /** When API provides full note body */
  noteBody?: string;
}

interface SessionNotesCardProps {
  /** Completed sessions that have trainer notes (from parent API when available) */
  items?: SessionNoteItem[];
  /** Open session detail / note detail for this schedule (e.g. SessionDetailModal or note view) */
  onViewSession?: (scheduleId: string, item: SessionNoteItem) => void;
  /** When true, sidebar is showing priority content only (compact/narrow) – hide or shorten list */
  showPriorityContent?: boolean;
}

/**
 * Session Notes Card (Parent Dashboard)
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Show trainer notes for completed sessions in the right sidebar.
 * Location: frontend/src/components/dashboard/SessionNotesCard.tsx
 *
 * - Renders after "Awaiting Review" in DashboardRightSidebar.
 * - Empty state when no notes; list of recent session notes when API provides data.
 * - When 20+ notes: shows initial batch, "Show more" expands to scrollable list; "Show less" collapses.
 * - Responsive: respects showPriorityContent for narrow layouts.
 */
export default function SessionNotesCard({
  items = [],
  onViewSession,
  showPriorityContent = false,
}: SessionNotesCardProps) {
  const [showAll, setShowAll] = useState(false);
  const hasItems = items.length > 0;
  const hasMoreThanInitial = items.length > INITIAL_VISIBLE_COUNT;
  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE_COUNT);
  const toggleShowAll = useCallback(() => setShowAll((prev) => !prev), []);

  if (showPriorityContent) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 overflow-hidden">
        <div className="px-4 py-3 border-b border-[#e8eaed] dark:border-gray-700">
          <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
            <FileText size={14} className="text-[#5f6368] dark:text-gray-400" aria-hidden />
            Trainer notes
          </h3>
          <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-1">
            {hasItems ? `${items.length} note${items.length !== 1 ? 's' : ''} from completed sessions` : 'Summary notes from the trainer after each session.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#dadce0] dark:border-gray-600 overflow-hidden">
      <div className="px-4 py-3 border-b border-[#e8eaed] dark:border-gray-700">
        <h3 className="text-[11px] font-medium uppercase tracking-wide text-[#5f6368] dark:text-gray-400 flex items-center gap-2">
          <FileText size={14} className="text-[#5f6368] dark:text-gray-400" aria-hidden />
          Trainer notes
        </h3>
        <p className="text-xs text-[#5f6368] dark:text-gray-400 mt-1">
          Summary notes from the trainer after each session (activity logs are visible live and after the session).
        </p>
      </div>
      <div className="px-4 py-2">
        {!hasItems ? (
          <div className="py-3 px-3 rounded-lg bg-[#f8f9fa] dark:bg-gray-700/50">
            <p className="text-xs text-[#5f6368] dark:text-gray-400">
              No trainer notes yet. Summary notes from your child&rsquo;s trainer will appear here after completed sessions.
            </p>
          </div>
        ) : (
          <>
            <div
              className={showAll && hasMoreThanInitial ? 'overflow-y-auto' : ''}
              style={showAll && hasMoreThanInitial ? { maxHeight: EXPANDED_LIST_MAX_HEIGHT } : undefined}
            >
              <ul className="space-y-1.5" aria-label="Session notes list">
                {visibleItems.map((item) => (
                  <li key={`${item.scheduleId}-${item.childId}`}>
                    <button
                      type="button"
                      onClick={() => onViewSession?.(item.scheduleId, item)}
                      className="w-full text-left py-2 px-3 rounded-r-md border-l-4 border-l-[#1a73e8] dark:border-l-blue-500 bg-[#e8f0fe] dark:bg-blue-900/20 hover:bg-[#d2e3fc] dark:hover:bg-blue-900/30 transition-colors flex items-center gap-2 group"
                    >
                      <span className="flex-1 min-w-0">
                        <span className="text-xs font-medium text-[#202124] dark:text-gray-100 block truncate">
                          {item.childName}
                        </span>
                        <span className="text-[11px] text-[#5f6368] dark:text-gray-400">
                          {moment(item.date).format('DD MMM YYYY')}
                        </span>
                        {item.noteSnippet && (
                          <span className="text-[11px] text-[#5f6368] dark:text-gray-400 block mt-0.5 line-clamp-2">
                            {item.noteSnippet}
                          </span>
                        )}
                      </span>
                      <ChevronRight size={14} className="text-[#1a73e8] dark:text-blue-400 shrink-0 group-hover:translate-x-0.5 transition-transform" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {hasItems && hasMoreThanInitial && (
              <div className="mt-2 px-1">
                <button
                  type="button"
                  onClick={toggleShowAll}
                  className="text-[11px] font-medium text-[#1a73e8] dark:text-blue-400 hover:underline flex items-center gap-1"
                  aria-expanded={showAll}
                >
                  {showAll ? (
                    <>
                      <ChevronUp size={12} aria-hidden />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown size={12} aria-hidden />
                      Show more ({items.length - INITIAL_VISIBLE_COUNT} more)
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
