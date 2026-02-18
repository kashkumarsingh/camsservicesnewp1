'use client';

import React, { useState } from 'react';
import moment from 'moment';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarGridProps {
  startDate: moment.Moment | null;
  setStartDate: (date: moment.Moment | null) => void;
  minDate: moment.Moment;
  filterDate: (date: moment.Moment) => boolean;
  durationWeeks: number;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ startDate, setStartDate, minDate, filterDate, durationWeeks }) => {
  const [currentMonth, setCurrentMonth] = useState(moment());

  const startOfMonth = currentMonth.clone().startOf('month');
  const endOfMonth = currentMonth.clone().endOf('month');
  const startDay = startOfMonth.clone().startOf('week');
  const endDay = endOfMonth.clone().endOf('week');

  const calendarDays: moment.Moment[] = [];
  const day = startDay.clone();

  while (day.isBefore(endDay)) {
    calendarDays.push(day.clone());
    day.add(1, 'day');
  }

  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.clone().subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.clone().add(1, 'month'));
  };

  const handleDateClick = (date: moment.Moment) => {
    if (filterDate(date) && date.isSameOrAfter(minDate, 'day')) {
      setStartDate(date);
    }
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-200">
        <ChevronLeft size={20} />
      </button>
      <h3 className="text-lg font-semibold">{currentMonth.format('MMMM YYYY')}</h3>
      <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200">
        <ChevronRight size={20} />
      </button>
    </div>
  );

  const renderDaysOfWeek = () => (
    <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-2">
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
        <div key={day}>{day}</div>
      ))}
    </div>
  );

  const renderCells = () => (
    <div className="grid grid-cols-7 gap-1">
      {calendarDays.map((date, index) => {
        const isCurrentMonth = date.month() === currentMonth.month();
        const isSelectable = filterDate(date) && date.isSameOrAfter(minDate, 'day');
        const isSelected = startDate && date.isSame(startDate, 'day');

        let dayClasses = 'p-2 rounded-md text-center text-sm';
        if (!isCurrentMonth) {
          dayClasses += ' text-gray-400';
        }
        if (isSelectable) {
          dayClasses += ' cursor-pointer hover:bg-blue-100';
          if (date.day() === 1) { // Mondays (Available)
            dayClasses += ' bg-green-100 text-green-800';
          }
        }
        if (isSelected) {
          dayClasses += ' !bg-primary text-white font-bold';
        }
        if (!isSelectable) {
          dayClasses += ' text-gray-300 cursor-not-allowed';
        }

        return (
          <div key={index} className={dayClasses} onClick={() => handleDateClick(date)}>
            {date.date()}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {renderHeader()}
      {renderDaysOfWeek()}
      {renderCells()}
      {startDate && (
        <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800 text-sm font-medium">
          Program: {startDate.format('dddd DD MMMM YYYY')} to {startDate.clone().add(durationWeeks - 1, 'weeks').endOf('isoWeek').format('DD MMMM YYYY')}
        </div>
      )}
    </div>
  );
};

export default CalendarGrid;