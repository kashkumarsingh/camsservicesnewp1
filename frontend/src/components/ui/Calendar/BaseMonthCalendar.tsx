import React from 'react';
import moment, { Moment } from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCalendarGrid } from './useCalendarGrid';

interface BaseMonthCalendarProps {
  currentMonth: Moment;
  onMonthChange: (month: Moment) => void;
  renderDayCell: (date: Moment, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  gridStyle?: 'borders' | 'gaps'; // Google Calendar style (borders) or Dashboard style (gaps)
  showWeekdayHeaders?: boolean;
  weekdayHeaders?: string[];
}

/**
 * BaseMonthCalendar Component
 * 
 * Reusable base component for month view calendars.
 * Provides shared structure: header, navigation, weekday headers, grid.
 * 
 * Used by:
 * - Dashboard calendar (ChildrenActivitiesCalendar)
 * - Booking session calendar (MonthCalendar)
 * 
 * Features:
 * - Month navigation (prev/next)
 * - Weekday headers
 * - Calendar grid generation
 * - Customizable day cell rendering
 * - Google Calendar aesthetic support
 */
export default function BaseMonthCalendar({
  currentMonth,
  onMonthChange,
  renderDayCell,
  className = '',
  headerClassName = '',
  gridStyle = 'borders', // Default to Google Calendar style
  showWeekdayHeaders = true,
  weekdayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
}: BaseMonthCalendarProps) {
  const calendarDays = useCalendarGrid(currentMonth);

  const handlePrevMonth = () => {
    onMonthChange(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    onMonthChange(currentMonth.clone().add(1, 'month'));
  };

  return (
    <div className={className}>
      {/* Month Header with Navigation */}
      <div className={`flex items-center justify-between mb-2 sm:mb-3 md:mb-4 ${headerClassName}`}>
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
        </button>
        
        <button
          type="button"
          onClick={() => onMonthChange(moment())}
          className="text-sm sm:text-base md:text-xl lg:text-2xl font-bold text-navy-blue dark:text-gray-100 px-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          aria-label="Go to current month"
        >
          {currentMonth.format('MMMM YYYY')}
        </button>
        
        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1.5 sm:p-2 md:p-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Weekday Headers - Google Calendar Style */}
      {showWeekdayHeaders && (
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekdayHeaders.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] sm:text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 py-1 sm:py-1.5 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
            >
              {day}
            </div>
          ))}
        </div>
      )}

      {/* Calendar Grid - Google Calendar Style (borders) or Dashboard Style (gaps) */}
      {gridStyle === 'borders' ? (
        <div className="grid grid-cols-7 border-l border-t border-gray-200 dark:border-gray-700">
          {calendarDays.map((date, index) => (
            <React.Fragment key={`day-${date.format('YYYY-MM-DD')}-${index}`}>
              {renderDayCell(date, index)}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((date, index) => (
            <React.Fragment key={`day-${date.format('YYYY-MM-DD')}-${index}`}>
              {renderDayCell(date, index)}
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
}
