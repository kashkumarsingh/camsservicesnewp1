'use client';

import React from 'react';
import type { TrainerSchedule } from '@/core/application/trainer/types';
import { Calendar, Clock, Package, Users } from 'lucide-react';

interface ScheduleListProps {
  schedules: TrainerSchedule[];
  onScheduleClick?: (bookingId: number) => void;
}

export default function ScheduleList({ schedules, onScheduleClick }: ScheduleListProps) {
  if (schedules.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedules</h3>
        <p className="text-gray-600">You don't have any schedules assigned for this period.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'no_show':
        return 'bg-orange-100 text-orange-800';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Group schedules by date
  const schedulesByDate = schedules.reduce((acc, schedule) => {
    const date = schedule.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(schedule);
    return acc;
  }, {} as Record<string, TrainerSchedule[]>);

  return (
    <div className="space-y-6">
      {Object.entries(schedulesByDate)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, dateSchedules]) => (
          <div key={date} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900">
                {new Date(date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {dateSchedules.length} schedule{dateSchedules.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {dateSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  onClick={() => {
                  const bid = schedule.bookingId ?? schedule.booking_id;
                  if (bid != null) onScheduleClick?.(bid);
                }}
                  className={`block px-6 py-4 hover:bg-gray-50 transition-colors ${onScheduleClick ? 'cursor-pointer' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          Session · Ref: {schedule.booking.reference}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                          {schedule.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {(schedule.startTime ?? schedule.start_time ?? '').substring(0, 5)} - {(schedule.endTime ?? schedule.end_time ?? '').substring(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          <span>Ref: {schedule.booking.reference}</span>
                        </div>
                        {schedule.activities.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{schedule.activities.length} activit{schedule.activities.length !== 1 ? 'ies' : 'y'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

