'use client';

import React from 'react';
import moment, { Moment } from 'moment';
import BaseMonthCalendar from '@/components/ui/Calendar/BaseMonthCalendar';
import { calendarUtils } from '@/components/ui/Calendar/useCalendarGrid';

interface BookedSessionData {
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  activities: { id: number; name: string; duration?: number }[];
  notes?: string;
}

interface MonthCalendarProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  blockedDates?: string[];
  bookedSessions?: BookedSessionData[]; // NEW: Full session data
  onBookedDateClick?: (date: string, session: BookedSessionData) => void; // NEW: Click handler for booked dates
  minDate?: Moment;
  maxDate?: Moment;
  currentMonth: Moment;
  onMonthChange: (month: Moment) => void;
  editingDate?: string; // Date currently being edited (should be highlighted)
}

/**
 * MonthCalendar Component
 * 
 * Visual monthly calendar for date selection (Calendar-First Booking Flow)
 * 
 * Features:
 * - Month view with clickable dates
 * - Blocked dates (already booked)
 * - Min/max date constraints
 * - Mobile-friendly design
 * - Color-coded dates (today, selected, blocked)
 */
export default function MonthCalendar({
  selectedDate,
  onDateSelect,
  blockedDates = [],
  bookedSessions = [],
  onBookedDateClick,
  minDate,
  maxDate,
  currentMonth,
  onMonthChange,
  editingDate,
}: MonthCalendarProps) {
  
  // Removed complex tooltip - now just shows hours on hover badge

  // Check if date is blocked
  const isDateBlocked = (date: Moment): boolean => {
    const dateStr = date.format('YYYY-MM-DD');
    return blockedDates.includes(dateStr);
  };

  // Get booked session for a date
  const getBookedSession = (date: Moment): BookedSessionData | null => {
    const dateStr = date.format('YYYY-MM-DD');
    const session = bookedSessions.find(s => s.date === dateStr) || null;
    // Debug logging removed to reduce console spam
    // Trainer's Choice detection works correctly - no need to log every render
    // Uncomment only when debugging Trainer's Choice display issues
    // if (session) {
    //   const hasActivities = session.activities && Array.isArray(session.activities) && session.activities.length > 0;
    //   if (!hasActivities) {
    //     console.log('[MonthCalendar] Trainer\'s Choice session detected:', { 
    //       date: dateStr, 
    //       activities: session.activities,
    //       activitiesLength: session.activities?.length,
    //       activitiesType: Array.isArray(session.activities),
    //     });
    //   }
    // }
    return session;
  };

  // Check if date is disabled (before today/minDate or after maxDate)
  const isDateDisabled = (date: Moment): boolean => {
    const today = moment().startOf('day');
    // Disable if before today
    if (date.isBefore(today, 'day')) return true;
    // Disable if before minDate
    if (minDate && date.isBefore(minDate, 'day')) return true;
    // Disable if after maxDate
    if (maxDate && date.isAfter(maxDate, 'day')) return true;
    return false;
  };

  // Check if date is selected
  const isSelected = (date: Moment): boolean => {
    if (!selectedDate) return false;
    return date.format('YYYY-MM-DD') === selectedDate;
  };

  // Check if date is being edited
  const isEditing = (date: Moment): boolean => {
    if (!editingDate) return false;
    return date.format('YYYY-MM-DD') === editingDate;
  };

  // Handle date click
  const handleDateClick = (date: Moment) => {
    const dateStr = date.format('YYYY-MM-DD');
    const bookedSession = getBookedSession(date);
    
    // If date is booked and we have a click handler, trigger it
    if (bookedSession && onBookedDateClick) {
      onBookedDateClick(dateStr, bookedSession);
      return;
    }
    
    // Otherwise, if date is disabled or blocked, do nothing
    if (isDateDisabled(date) || isDateBlocked(date)) return;
    
    // Normal date selection for new booking
    onDateSelect(dateStr);
  };

  // Render day cell for booking calendar
  const renderDayCell = (date: Moment, index: number) => {
    const blocked = isDateBlocked(date);
    const bookedSession = getBookedSession(date);
    const disabled = isDateDisabled(date);
    const today = calendarUtils.isToday(date);
    const selected = isSelected(date);
    const editing = isEditing(date);
    const inCurrentMonth = calendarUtils.isCurrentMonth(date, currentMonth);
    const isPast = calendarUtils.isPast(date);
    const isClickableBooked = bookedSession && onBookedDateClick; // Booked and has click handler
    
    // Check if booked date should show background (future booked dates)
    const shouldShowBookedBackground = bookedSession && !isPast;
    // Check if booked date is in the past (still show indicator but different styling)
    const isPastBooked = bookedSession && isPast;

    return (
      <div 
        key={index} 
        className={`
          min-h-[60px] sm:min-h-[70px] md:min-h-[100px] lg:min-h-[120px] border-r border-b border-gray-200 relative
          ${!inCurrentMonth ? 'bg-gray-50' : 
            isPast && !bookedSession ? 'bg-gray-100/50' : 
            shouldShowBookedBackground ? 'bg-emerald-50 border-l-2 border-l-emerald-300' :
            isPastBooked ? 'bg-gray-100/70 border-l-2 border-l-gray-400' :
            selected ? 'bg-blue-100 border-l-2 border-l-blue-500' :
            today ? 'bg-blue-50 border-l-2 border-l-blue-400' :
            'bg-white'
          }
          ${editing ? 'ring-2 ring-amber-400 ring-offset-1 bg-amber-50/70' : ''}
        `}
      >
        <button
          type="button"
          onClick={() => handleDateClick(date)}
          disabled={disabled && !isClickableBooked}
          className="w-full h-full flex flex-col items-start p-0.5 sm:p-1 md:p-1.5 text-left relative hover:bg-gray-50/50 transition-colors cursor-pointer disabled:cursor-not-allowed min-h-[60px] sm:min-h-[70px]"
        >
          {/* DATE NUMBER - Google Calendar style (top-left, small, with today circle) */}
          <div className="flex items-center justify-center mb-0.5 sm:mb-1 w-full">
                  {today && !editing ? (
                    <span className={`
                      w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-semibold
                      ${selected ? 'bg-blue-600 text-white ring-2 ring-blue-300' : 'bg-blue-600 text-white'}
                    `}>
                      {date.format('D')}
                    </span>
                  ) : editing ? (
                    <span className={`
                      w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-medium
                      bg-amber-500 text-white ring-1 sm:ring-2 ring-amber-400 ring-offset-0 sm:ring-offset-1
                    `}>
                      {date.format('D')}
                    </span>
                  ) : selected ? (
                    <span className={`
                      w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-xs md:text-sm font-semibold
                      bg-blue-500 text-white
                    `}>
                      {date.format('D')}
                    </span>
                  ) : (
                    <span className={`
                      text-[10px] sm:text-xs md:text-sm font-medium px-0.5 sm:px-1
                      ${bookedSession && !isPast ? 'text-green-800 font-semibold' :
                        bookedSession && isPast ? 'text-gray-400' :
                        isPast ? 'text-gray-400' : 
                        disabled ? 'text-gray-300' :
                        !inCurrentMonth ? 'text-gray-300' :
                        'text-gray-700'
                      }
                    `}>
                      {date.format('D')}
            </span>
          )}
        </div>
        
        {/* ACTIVITIES OR TRAINER'S CHOICE - Google Calendar style (full-width colored bars) */}
        {bookedSession && (
          <div className="w-full space-y-0.5 mt-0.5 flex-1 overflow-hidden">
            {/* Show activities if present, otherwise show Trainer's Choice */}
            {(() => {
              const hasActivities = bookedSession.activities && 
                                   Array.isArray(bookedSession.activities) && 
                                   bookedSession.activities.length > 0;
              
              if (hasActivities) {
                return (
                  <>
                    {bookedSession.activities.slice(0, 2).map((activity, idx) => {
                      const activityName = typeof activity === 'string' ? activity : (activity?.name || 'Activity');
                      return (
                        <div
                          key={`${bookedSession.date}-activity-${idx}`}
                          className={`
                            w-full text-[9px] sm:text-[10px] md:text-xs font-medium truncate px-1 sm:px-1.5 py-0.5 rounded-sm
                            ${isPast
                              ? 'bg-gray-300/60 text-gray-500'
                              : 'bg-green-100 text-green-800 border-l border-green-500 sm:border-l-2'
                            }
                          `}
                          title={activityName}
                        >
                          {activityName}
                        </div>
                      );
                    })}
                    {bookedSession.activities.length > 2 && (
                      <div className={`
                        text-[9px] sm:text-[10px] md:text-xs font-medium text-gray-600 px-1 sm:px-1.5 py-0.5
                        ${isPast ? 'text-gray-500' : 'text-green-700'}
                      `}>
                        +{bookedSession.activities.length - 2}
                      </div>
                    )}
                  </>
                );
              } else {
                // Show "Trainer's Choice" indicator when no activities (parent left it to trainer)
                return (
                  <div className={`
                    w-full text-[9px] sm:text-[10px] md:text-xs font-medium px-1 sm:px-1.5 py-0.5 rounded-sm
                    ${isPast
                      ? 'bg-gray-300/60 text-gray-500'
                      : 'bg-blue-100 text-blue-800 border-l border-blue-500 sm:border-l-2'
                    }
                  `} title="Trainer will choose activities">
                    Trainer's Choice
                  </div>
                );
              }
            })()}
            {/* DURATION - Always show total session hours */}
            <div className={`
              text-[9px] sm:text-[10px] md:text-xs font-medium px-1 sm:px-1.5 py-0.5 mt-0.5
              ${isPast ? 'text-gray-500' : 'text-green-700 font-semibold'}
            `}>
              {bookedSession.duration}h
            </div>
          </div>
        )}
      </button>
    </div>
    );
  };

  return (
    <div className="bg-white rounded-card shadow-card border border-gray-200 md:border-2 p-2 sm:p-4 md:p-6">
      <BaseMonthCalendar
        currentMonth={currentMonth}
        onMonthChange={onMonthChange}
        renderDayCell={renderDayCell}
        gridStyle="borders"
        showWeekdayHeaders={true}
      />
    </div>
  );
}
