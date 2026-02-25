'use client';

import React, { useMemo, useState } from 'react';
import moment, { Moment } from 'moment';
import { ChevronLeft, ChevronRight, Calendar, Clock, Edit2 } from 'lucide-react';

export interface CalendarSession {
  id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string;
  duration: number; // hours
  activities?: Array<{ id: number; name: string }>;
  customActivities?: Array<{ name: string; duration: number }>;
  status?: 'draft' | 'confirmed';
}

interface SessionCalendarGridProps {
  sessions: CalendarSession[];
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD
  onDateClick: (date: string) => void;
  onSessionClick?: (session: CalendarSession) => void;
}

/**
 * SessionCalendarGrid Component
 * 
 * Visual calendar grid showing booked sessions (inspired by Facebook Business Suite)
 * 
 * Features:
 * - Month/Week views
 * - Session blocks on dates
 * - Click date to book
 * - Click session to view/edit
 * - Color-coded by type (database activities vs custom)
 * - Mobile-friendly
 */
export default function SessionCalendarGrid({
  sessions,
  minDate,
  maxDate,
  onDateClick,
  onSessionClick,
}: SessionCalendarGridProps) {
  
  const [currentMonth, setCurrentMonth] = useState<Moment>(moment());
  
  // Group sessions by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, CalendarSession[]>();
    sessions.forEach(session => {
      const existing = map.get(session.date) || [];
      existing.push(session);
      map.set(session.date, existing);
    });
    return map;
  }, [sessions]);
  
  // Generate calendar grid
  const calendarDays = useMemo(() => {
    const startOfMonth = currentMonth.clone().startOf('month');
    const endOfMonth = currentMonth.clone().endOf('month');
    const startDate = startOfMonth.clone().startOf('week');
    const endDate = endOfMonth.clone().endOf('week');

    const days: Moment[] = [];
    const day = startDate.clone();

    while (day.isSameOrBefore(endDate)) {
      days.push(day.clone());
      day.add(1, 'day');
    }

    return days;
  }, [currentMonth]);
  
  // Check if date is disabled
  const isDateDisabled = (date: Moment): boolean => {
    const dateStr = date.format('YYYY-MM-DD');
    if (minDate && dateStr < minDate) return true;
    if (maxDate && dateStr > maxDate) return true;
    return false;
  };
  
  // Check if date is today
  const isToday = (date: Moment): boolean => {
    return date.isSame(moment(), 'day');
  };
  
  // Check if date is in current month
  const isCurrentMonth = (date: Moment): boolean => {
    return date.isSame(currentMonth, 'month');
  };
  
  // Handle date click
  const handleDateClick = (date: Moment) => {
    if (isDateDisabled(date)) return;
    onDateClick(date.format('YYYY-MM-DD'));
  };
  
  // Navigation
  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  return (
    <div className="bg-white rounded-card shadow-card border-2 border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Session Calendar
              </h2>
              <p className="text-xs text-white/80">
                View and manage your booked sessions
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="bg-gray-50 px-6 py-4 border-b-2 border-gray-200">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h3 className="text-2xl font-bold text-navy-blue">
            {currentMonth.format('MMMM YYYY')}
          </h3>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className="p-2 hover:bg-white rounded-lg transition-colors shadow-sm border border-gray-200"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div
              key={day}
              className="text-center text-sm font-bold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const dateStr = date.format('YYYY-MM-DD');
            const daySessions = sessionsByDate.get(dateStr) || [];
            const disabled = isDateDisabled(date);
            const today = isToday(date);
            const inCurrentMonth = isCurrentMonth(date);

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] rounded-xl border-2 transition-all
                  ${!inCurrentMonth ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'}
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:border-blue-300 hover:shadow-md'}
                  ${today ? 'ring-2 ring-blue-500' : ''}
                `}
                onClick={() => !disabled && handleDateClick(date)}
              >
                {/* Date Number */}
                <div className="p-2">
                  <div
                    className={`
                      text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center
                      ${today
                        ? 'bg-blue-500 text-white'
                        : inCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-400'
                      }
                    `}
                  >
                    {date.format('D')}
                  </div>
                </div>

                {/* Sessions */}
                {daySessions.length > 0 && (
                  <div className="px-2 pb-2 space-y-1">
                    {daySessions.slice(0, 2).map((session, idx) => {
                      const hasCustomActivities = session.customActivities && session.customActivities.length > 0;
                      const hasDbActivities = session.activities && session.activities.length > 0;
                      
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSessionClick?.(session);
                          }}
                          className={`
                            w-full text-left px-2 py-1 rounded-lg text-xs font-semibold transition-all
                            ${hasCustomActivities
                              ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200 hover:from-purple-200 hover:to-pink-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200'
                            }
                          `}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{session.startTime}</span>
                          </div>
                        </button>
                      );
                    })}
                    
                    {daySessions.length > 2 && (
                      <div className="text-xs text-gray-500 font-semibold text-center">
                        +{daySessions.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 px-6 py-4 border-t-2 border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 border border-blue-200"></div>
            <span className="text-gray-700 font-medium">🎯 Database Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200"></div>
            <span className="text-gray-700 font-medium">✨ Custom Activity</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-blue-500"></div>
            <span className="text-gray-700 font-medium">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
