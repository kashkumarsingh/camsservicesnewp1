/**
 * Calendar Skeleton Component
 * 
 * Reusable skeleton loading component for month-view calendar.
 * Matches the ChildrenActivitiesCalendar component structure.
 */

import React from 'react';

export default function CalendarSkeleton() {
  // 7 days per week, 5 weeks displayed (35 days)
  const calendarDays = Array.from({ length: 35 }, (_, i) => i);
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6 animate-pulse overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {weekDays.map((day, index) => (
          <div
            key={`weekday-skeleton-${index}`}
            className="text-center py-2"
          >
            <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day) => (
          <div
            key={`calendar-day-skeleton-${day}`}
            className="aspect-square border border-gray-200 dark:border-gray-700 rounded-lg p-1 sm:p-2"
          >
            <div className="h-4 w-6 bg-gray-200 dark:bg-gray-700 rounded mb-1" />
            {day % 4 === 0 && (
              <div className="space-y-1">
                <div className="h-4 w-full bg-blue-100 dark:bg-blue-900/40 rounded" />
                {day % 8 === 0 && <div className="h-4 w-full bg-green-100 dark:bg-green-900/40 rounded" />}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
          {[1, 2, 3].map((i) => (
            <div key={`legend-skeleton-${i}`} className="flex items-center gap-2">
              <div className="h-3 w-3 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
