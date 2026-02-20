'use client';

import React, { useState, useRef, useEffect } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DateService, CalendarDay } from '@/infrastructure/services/calendar';

interface HorizontalCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onDateSelect: (date: string) => void;
  minDate?: string; // YYYY-MM-DD
  maxDate?: string; // YYYY-MM-DD - Maximum selectable date (e.g., based on package weeks constraint)
  className?: string;
  markedDates?: string[]; // dates that already have sessions (in current booking)
  blockedDates?: string[]; // dates that are booked in other bookings (should be disabled)
  editingDate?: string; // date currently being edited (should NOT be grayed out)
}

/**
 * Horizontal Calendar Component - Inspired by Publer
 * Mobile-first, swipeable date picker
 * 2025 UX Trend: Horizontal scrolling calendars
 */
const HorizontalCalendar: React.FC<HorizontalCalendarProps> = ({
  selectedDate,
  onDateSelect,
  minDate,
  maxDate,
  className = '',
  markedDates = [],
  blockedDates = [],
  editingDate,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Generate days using DateService
  const days: CalendarDay[] = DateService.generateDays({
    startDate: minDate,
    daysCount: 30,
    minDate,
    maxDate,
    markedDates,
    blockedDates,
    editingDate,
    selectedDate,
  });

  // Check scroll position for arrows
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setShowLeftArrow(container.scrollLeft > 0);
    setShowRightArrow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      return () => container.removeEventListener('scroll', checkScroll);
    }
  }, []);

  // Scroll to selected date on mount
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const selectedIndex = days.findIndex(
      (day) => day.dateString === selectedDate
    );

    if (selectedIndex !== -1) {
      const dayWidth = 80; // Approximate width of each day card
      const scrollPosition = selectedIndex * dayWidth - container.clientWidth / 2 + dayWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollPosition), behavior: 'smooth' });
    }
  }, [selectedDate, days]);  

  const scrollLeft = () => {
    scrollContainerRef.current?.scrollBy({ left: -200, behavior: 'smooth' });
  };

  const scrollRight = () => {
    scrollContainerRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  const handleDateClick = (day: CalendarDay) => {
    // Don't allow selecting disabled/blocked dates
    if (day.isDisabled) {
      return;
    }
    onDateSelect(day.dateString);
  };

  const monthLabel = DateService.getMonthLabel(selectedDate);
  return (
    <div className={`relative ${className}`}>
      {/* Month Label */}
      <div className="flex items-center justify-between px-8 py-1">
        <span className="text-sm font-semibold text-gray-700">{monthLabel}</span>
      </div>
      {/* Left Arrow */}
      {showLeftArrow && (
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-100 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-8 py-2"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {days.map((day, index) => {
          return (
            <button
              key={day.dateString}
              onClick={() => handleDateClick(day)}
              disabled={day.isDisabled}
              className={`
                flex-shrink-0 flex flex-col items-center justify-center
                w-16 h-20 rounded-xl
                transition-all duration-200
                ${
                  day.isDisabled
                    ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 opacity-60 cursor-not-allowed'
                    : day.isSelected
                    ? 'bg-gradient-to-br from-primary-blue to-light-blue-cyan text-white shadow-lg scale-105 cursor-pointer'
                    : day.isToday && !day.isBooked
                    ? 'bg-blue-50 border-2 border-primary-blue text-primary-blue cursor-pointer'
                    : day.isBooked
                    ? 'bg-gray-100 border-2 border-gray-300 text-gray-400 opacity-60 cursor-not-allowed'
                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-primary-blue hover:bg-blue-50 cursor-pointer'
                }
              `}
              title={
                day.isDisabled
                  ? blockedDates.includes(day.dateString)
                    ? 'This date is already booked for this child'
                    : maxDate && moment(day.dateString).isAfter(moment(maxDate), 'day')
                    ? 'This date is outside the package booking window'
                    : 'This date is not available'
                  : undefined
              }
            >
              {/* Day of week */}
              <span
                className={`text-xs font-semibold mb-1 ${
                  day.isSelected ? 'text-white opacity-90' : 'text-gray-600'
                }`}
              >
                {day.dayOfWeek}
              </span>

              {/* Date */}
              <span className={`text-2xl font-bold ${day.isSelected ? 'text-white' : ''}`}>
                {day.dayNumber}
              </span>

              {/* Month (if different from previous) */}
              {(index === 0 || day.monthNumber !== days[index - 1].monthNumber) && (
                <span
                  className={`text-[10px] font-semibold mt-1 ${
                    day.isSelected ? 'text-white opacity-80' : 'text-gray-500'
                  }`}
                >
                  {day.month}
                </span>
              )}

              {/* Today indicator */}
              {day.isToday && !day.isSelected && (
                <div className="absolute bottom-1 w-1.5 h-1.5 bg-primary-blue rounded-full" />
              )}
              {markedDates.includes(day.dateString) && (
                <div className={`absolute -bottom-1.5 w-2 h-2 rounded-full ${day.isSelected ? 'bg-white' : 'bg-green-500'}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default HorizontalCalendar;


