'use client';

import React from 'react';
import type { ActivityLog } from '@/core/application/trainer/types';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';
import { Calendar, Award, TrendingUp, Clock } from 'lucide-react';

interface ProgressTimelineProps {
  logs: ActivityLog[];
  /** Display name for child – already privacy-safe for trainers. */
  childName?: string;
}

export default function ProgressTimeline({ logs, childName }: ProgressTimelineProps) {
  // Filter logs with milestones
  const milestoneLogs = logs.filter(log => log.milestone_achieved);

  // Group logs by date
  const logsByDate = logs.reduce((acc, log) => {
    const date = log.activity_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, ActivityLog[]>);

  const sortedDates = Object.keys(logsByDate).sort((a, b) => b.localeCompare(a));

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Progress Data</h3>
        <p className="text-gray-600">No activity logs available to show progress.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">
          Progress Timeline{childName && ` - ${childName}`}
        </h3>
        {milestoneLogs.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
            <Award className="h-4 w-4" />
            {milestoneLogs.length} Milestone{milestoneLogs.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sortedDates.map((date, dateIndex) => {
          const dateLogs = logsByDate[date];
          const hasMilestone = dateLogs.some(log => log.milestone_achieved);

          return (
            <div key={date} className="relative">
              {/* Timeline Line */}
              {dateIndex < sortedDates.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
              )}

              {/* Date Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  hasMilestone ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {hasMilestone ? (
                    <Award className="h-4 w-4" />
                  ) : (
                    <Calendar className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {new Date(date).toLocaleDateString('en-GB', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {dateLogs.length} activit{dateLogs.length !== 1 ? 'ies' : 'y'}
                  </p>
                </div>
              </div>

              {/* Activities for this date */}
              <div className="ml-12 space-y-3">
                {dateLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-lg border ${
                      log.milestone_achieved
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900">{log.activity_name}</h5>
                        {log.start_time && log.end_time && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{log.start_time.substring(0, 5)} - {log.end_time.substring(0, 5)}</span>
                          </div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        log.status === 'completed' ? 'bg-green-100 text-green-800' :
                        log.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {log.status.replace('_', ' ')}
                      </span>
                    </div>

                    {log.milestone_achieved && log.milestone_name && (
                      <div className="mt-2 p-2 bg-yellow-100 rounded border border-yellow-300">
                        <p className="text-sm font-semibold text-yellow-900">
                          🎉 Milestone: {log.milestone_name}
                        </p>
                        {log.milestone_description && (
                          <p className="text-xs text-yellow-800 mt-1">{log.milestone_description}</p>
                        )}
                      </div>
                    )}

                    {log.achievements && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-700 mb-1">Achievements:</p>
                        <p className="text-xs text-gray-600">{log.achievements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

