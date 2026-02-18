import React from 'react';
import moment from 'moment';
import type { BookedSession } from '../types';
import { formatHours } from '@/utils/formatHours';
import { Calendar, Clock, Sparkles } from 'lucide-react';

interface ReviewScheduleProps {
  sessions: BookedSession[];
}

const ReviewSchedule: React.FC<ReviewScheduleProps> = ({ sessions }) => (
  <div className="space-y-4">
    {[...sessions]
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      })
      .map((session, index) => (
        <div
          key={`${session.date}-${session.startTime}-${index}`}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-[#0080FF] rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-5 h-5 text-[#0080FF]" />
                <h4 className="font-bold text-[#1E3A5F] text-base">
                  {moment(session.date).format('dddd, MMMM D, YYYY')}
                </h4>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-3">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-semibold">
                  {session.startTime} - {session.endTime}
                </span>
                <span className="text-gray-500">({formatHours(session.duration)})</span>
              </div>
              {session.activities.some((activity) => activity.id === -1) ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-xs font-semibold">Trainer's Choice</span>
                </div>
              ) : session.activities.length > 0 ? (
                <div className="flex flex-wrap gap-2 mt-2">
                  {session.activities.map((activity, actIdx) => (
                    <span
                      key={`${activity.id}-${actIdx}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 text-xs font-medium"
                    >
                      {activity.name.replace('✨ ', '')}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ))}
  </div>
);

export default ReviewSchedule;
