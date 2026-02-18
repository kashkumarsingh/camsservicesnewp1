'use client';

import React, { useMemo } from 'react';
import moment, { Moment } from 'moment';
import type { TrainerSchedule } from '@/core/application/trainer/types';
import BaseMonthCalendar from '@/components/ui/Calendar/BaseMonthCalendar';
import { calendarUtils } from '@/components/ui/Calendar/useCalendarGrid';

interface ScheduleCalendarProps {
  schedules: TrainerSchedule[];
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onScheduleClick?: (schedule: TrainerSchedule) => void;
}

/**
 * Schedule Calendar Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Display trainer schedules in calendar view using universal BaseMonthCalendar
 * Location: frontend/src/components/trainer/schedules/ScheduleCalendar.tsx
 * 
 * Uses: BaseMonthCalendar (universal calendar component) - NO DUPLICATION
 */
export default function ScheduleCalendar({
  schedules,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onScheduleClick,
}: ScheduleCalendarProps) {
  // Convert month/year to Moment for BaseMonthCalendar
  const currentMonth = useMemo(() => {
    return moment(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`);
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (newMonth: Moment) => {
    onMonthChange(newMonth.month() + 1);
    onYearChange(newMonth.year());
  };

  // Get schedules for a specific date
  const getSchedulesForDate = (date: Moment): TrainerSchedule[] => {
    const dateStr = date.format('YYYY-MM-DD');
    return schedules.filter(schedule => schedule.date === dateStr);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5">
      <BaseMonthCalendar
        currentMonth={currentMonth}
        onMonthChange={handleMonthChange}
        gridStyle="borders"
        showWeekdayHeaders={true}
        renderDayCell={(date, index) => {
          const dateSchedules = getSchedulesForDate(date);
          const isTodayDate = calendarUtils.isToday(date);
          const isCurrentMonthDate = calendarUtils.isCurrentMonth(date, currentMonth);

          return (
            <div
              key={index}
              className={`
                min-h-[65px] sm:min-h-[75px] border-r border-b border-gray-200 relative p-1 transition-colors
                ${!isCurrentMonthDate ? 'bg-gray-50' : 
                  isTodayDate ? 'bg-blue-50' :
                  'bg-white'
                }
                ${dateSchedules.length > 0 ? 'cursor-pointer hover:bg-gray-50' : ''}
              `}
            >
              {/* Date number */}
              <div className="flex items-center justify-center mb-1 w-full">
                {isTodayDate ? (
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold bg-blue-600 text-white">
                    {date.format('D')}
                  </span>
                ) : (
                  <span className={`
                    text-xs font-medium
                    ${!isCurrentMonthDate ? 'text-gray-400' : 'text-gray-700'}
                  `}>
                    {date.format('D')}
                  </span>
                )}
              </div>

              {/* Schedules for this date */}
              <div className="space-y-0.5">
                {dateSchedules.slice(0, 3).map((schedule) => {
                  const startTime = moment(schedule.start_time, 'HH:mm').format('ha');

                  return (
                    <div
                      key={schedule.id}
                      onClick={() => onScheduleClick?.(schedule)}
                      className={`
                        text-[10px] px-1 py-0.5 rounded truncate relative mb-0.5 transition-opacity
                        ${onScheduleClick ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}
                      `}
                      style={{
                        backgroundColor: '#0080FF20',
                        borderLeft: '3px solid #0080FF',
                        color: '#1f2937',
                      }}
                      title={`${schedule.start_time.substring(0, 5)} - ${schedule.end_time.substring(0, 5)} session`}
                    >
                      <div className="flex items-center gap-0.5">
                        <span className="font-semibold text-gray-900 truncate text-[10px]">
                          {startTime}
                        </span>
                        <span className="text-gray-500 mx-0.5">•</span>
                        <span className="text-gray-600 text-[9px] truncate">Session</span>
                      </div>
                    </div>
                  );
                })}
                {dateSchedules.length > 3 && (
                  <div className="text-[9px] text-gray-500 font-medium px-1">
                    +{dateSchedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

