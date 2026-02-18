'use client';

import React, { useMemo } from 'react';
import { Calendar, FileText, Award, Clock } from 'lucide-react';
import type { ActivityLog } from '@/core/application/trainer/types';
import type { SessionNoteItem } from '@/components/dashboard/SessionNotesCard';

export interface ParentProgressTimelineProps {
  sessionNotes: SessionNoteItem[];
  activityLogs: ActivityLog[];
  onViewSession?: (scheduleId: string, item: SessionNoteItem) => void;
}

export default function ParentProgressTimeline({
  sessionNotes,
  activityLogs,
  onViewSession,
}: ParentProgressTimelineProps) {
  const byDate = useMemo(() => {
    const map = new Map<string, { notes: SessionNoteItem[]; logs: ActivityLog[] }>();
    sessionNotes.forEach((note) => {
      if (!map.has(note.date)) map.set(note.date, { notes: [], logs: [] });
      map.get(note.date)!.notes.push(note);
    });
    activityLogs.forEach((log) => {
      const date = typeof log.activity_date === 'string' ? log.activity_date : '';
      if (!date) return;
      if (!map.has(date)) map.set(date, { notes: [], logs: [] });
      map.get(date)!.logs.push(log);
    });
    return map;
  }, [sessionNotes, activityLogs]);

  const sortedDates = useMemo(
    () => Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a)),
    [byDate]
  );

  if (sortedDates.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 sm:p-6 space-y-6">
        {sortedDates.map((date, dateIndex) => {
          const { notes, logs } = byDate.get(date)!;
          const hasMilestone = logs.some((l) => l.milestone_achieved);
          const label = [notes.length && `${notes.length} note${notes.length !== 1 ? 's' : ''}`, logs.length && `${logs.length} activit${logs.length !== 1 ? 'ies' : 'y'}`].filter(Boolean).join(', ');
          return (
            <div key={date} className="relative">
              {dateIndex < sortedDates.length - 1 && (
                <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600" />
              )}
              <div className="flex items-center gap-4 mb-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${hasMilestone ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                  {hasMilestone ? <Award className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {new Date(date).toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
                </div>
              </div>
              <div className="ml-12 space-y-3">
                {notes.map((note) => (
                  <div key={`n-${note.scheduleId}-${note.childId}`} className="p-4 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{note.childName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{note.noteSnippet || note.noteBody || 'Session note'}</p>
                      </div>
                      {onViewSession && (
                        <button type="button" onClick={() => onViewSession(note.scheduleId, note)} className="flex-shrink-0 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">View session</button>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400"><FileText className="h-3 w-3" /> Session note</div>
                  </div>
                ))}
                {logs.map((log) => (
                  <div key={log.id} className={`p-4 rounded-lg border ${log.milestone_achieved ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700' : 'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-600'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h5 className="font-semibold text-gray-900 dark:text-gray-100">{log.activity_name}{log.child?.name && <span className="font-normal text-gray-600 dark:text-gray-400 ml-1"> · {log.child.name}</span>}</h5>
                        {log.start_time && log.end_time && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mt-1"><Clock className="h-3 w-3" /><span>{String(log.start_time).substring(0, 5)} – {String(log.end_time).substring(0, 5)}</span></div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${log.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' : log.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300'}`}>{log.status.replace('_', ' ')}</span>
                    </div>
                    {log.milestone_achieved && log.milestone_name && (
                      <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded border border-yellow-300 dark:border-yellow-700">
                        <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-200">Milestone: {log.milestone_name}</p>
                        {log.milestone_description && <p className="text-xs text-yellow-800 dark:text-yellow-300 mt-1">{log.milestone_description}</p>}
                      </div>
                    )}
                    {log.achievements && <div className="mt-2"><p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Achievements</p><p className="text-xs text-gray-600 dark:text-gray-400">{log.achievements}</p></div>}
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
