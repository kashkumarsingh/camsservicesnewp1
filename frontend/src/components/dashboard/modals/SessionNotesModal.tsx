'use client';

import React from 'react';
import { FileText, ChevronRight } from 'lucide-react';
import moment from 'moment';
import { BaseModal } from '@/components/ui/Modal';
import type { SessionNoteItem } from '@/components/dashboard/SessionNotesCard';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Session notes from parent dashboard API */
  items: SessionNoteItem[];
  /** Open session/note detail (e.g. SessionDetailModal). Caller may close this modal first. */
  onViewSession?: (scheduleId: string, item: SessionNoteItem) => void;
}

const MODAL_LIST_MAX_HEIGHT = 'min(400px, 70vh)';

/**
 * Session Notes Modal (Parent Dashboard)
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Show full list of trainer session notes in a modal (opened from header "Session notes" button).
 * Location: frontend/src/components/dashboard/modals/SessionNotesModal.tsx
 *
 * - Modal width: md. Scrollable list when many notes.
 * - Clicking an item calls onViewSession; parent typically closes this modal and opens SessionDetailModal.
 */
export default function SessionNotesModal({
  isOpen,
  onClose,
  items = [],
  onViewSession,
}: SessionNotesModalProps) {
  if (!isOpen) return null;

  const hasItems = items.length > 0;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <FileText size={20} className="text-[#1a73e8] dark:text-blue-400" aria-hidden />
          Trainer notes
        </span>
      }
      size="md"
    >
      <div className="p-0">
          {!hasItems ? (
            <p className="text-sm text-[#5f6368] dark:text-gray-400">
              No trainer notes yet. Summary notes from your child&rsquo;s trainer will appear here after completed sessions. You can also see live activity logs during and after each session from the schedule.
            </p>
          ) : (
            <ul
              className="space-y-1.5 overflow-y-auto pr-1"
              style={{ maxHeight: MODAL_LIST_MAX_HEIGHT }}
              aria-label="Session notes list"
            >
              {items.map((item) => (
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
          )}
      </div>
    </BaseModal>
  );
}
