'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Plus, ChevronDown, UserPlus, CalendarPlus } from 'lucide-react';
import type { Child } from '@/core/application/auth/types';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface DashboardLeftSidebarProps {
  children: Child[];
  bookings: BookingDTO[];
  /** Currently selected date on the main calendar (kept for API compatibility; mini calendar removed) */
  selectedDate?: string;
  /** Current month displayed on main calendar (kept for API compatibility; mini calendar removed) */
  currentMonth?: string;
  /** Set of dates in the current week range (kept for API compatibility; mini calendar removed) */
  datesInWeekRange?: Set<string>;
  /** Callback when user clicks a date (kept for API compatibility; mini calendar removed) */
  onDateSelect?: (date: string) => void;
  /** Callback when user clicks an unbookable date (kept for API compatibility; mini calendar removed) */
  onUnavailableDateClick?: (dateStr: string, reason?: string) => void;
  /** Callback when mini calendar month changes (kept for API compatibility; mini calendar removed) */
  onMonthChange?: (month: string) => void;
  /** Callback to open the booking modal */
  onBookSession?: () => void;
  /** Callback to open the add child modal */
  onAddChild?: () => void;
  /** Whether there are any children available for booking (approved and with active package) */
  hasBookableChildren: boolean;
  /** IDs of children currently visible on the main calendar (filter moved to right sidebar) */
  visibleChildIds?: number[];
  /** Toggle handler for child visibility (kept for API compatibility; UI moved to right sidebar) */
  onToggleChildVisibility?: (childId: number) => void;
}

export default function DashboardLeftSidebar({
  onBookSession,
  onAddChild,
  hasBookableChildren,
}: DashboardLeftSidebarProps) {
  const [showCreateDropdown, setShowCreateDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-4">
      {/* Create / Actions – primary control (mini calendar, upcoming sessions and children filter removed; main calendar is primary) */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowCreateDropdown(!showCreateDropdown)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium"
        >
          <Plus size={20} className="text-blue-600" />
          <span>Create</span>
          <ChevronDown size={16} className={`text-gray-500 dark:text-gray-400 transition-transform duration-200 ${showCreateDropdown ? 'rotate-180' : ''}`} />
        </button>

        {showCreateDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
            <button
              onClick={() => {
                onBookSession?.();
                setShowCreateDropdown(false);
              }}
              disabled={!hasBookableChildren}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CalendarPlus size={18} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Book Session</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Schedule an activity session</p>
              </div>
            </button>
            <div className="border-t border-gray-100 dark:border-gray-600" />
            <button
              onClick={() => {
                onAddChild?.();
                setShowCreateDropdown(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <UserPlus size={18} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Add Child</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Register a new child</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
