'use client';

import React from 'react';
import type { ActivityLog } from '@/core/application/trainer/types';
import { Calendar, Clock, User, CheckCircle, AlertCircle, Image as ImageIcon, Award } from 'lucide-react';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';
import { EmptyState } from '@/components/dashboard/universal/EmptyState';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface ActivityLogListProps {
  logs: ActivityLog[];
  showChildName?: boolean;
  onLogClick?: (logId: number) => void;
  variant?: 'full' | 'compact';
}

export default function ActivityLogList({
  logs,
  showChildName = true,
  onLogClick,
  variant = 'full',
}: ActivityLogListProps) {
  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12">
        <EmptyState
          title={EMPTY_STATE.NO_ACTIVITY_LOGS_FOR_PERIOD.title}
          message={EMPTY_STATE.NO_ACTIVITY_LOGS_FOR_PERIOD.message}
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'needs_attention':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'needs_attention':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isCompact = variant === 'compact';

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <div 
          key={log.id} 
          className={`bg-white rounded-lg ${isCompact ? 'shadow-sm p-4' : 'shadow p-6 hover:shadow-lg'} transition-shadow ${onLogClick ? 'cursor-pointer' : ''}`}
          onClick={() => onLogClick?.(log.id)}
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className={`font-semibold text-gray-900 ${isCompact ? 'text-sm' : 'text-lg'}`}>
                  {log.activity_name}
                </h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(log.status)}`}>
                  {getStatusIcon(log.status)}
                  {log.status.replace('_', ' ')}
                </span>
                {log.milestone_achieved && (
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    Milestone
                  </span>
                )}
              </div>

              <div className={`flex flex-wrap items-center gap-3 ${isCompact ? 'text-xs mb-2' : 'text-sm mb-3'} text-gray-600`}>
                {showChildName && log.child && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{getTrainerChildDisplayName(log.child.name)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(log.activity_date).toLocaleDateString('en-GB', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}</span>
                </div>
                {log.start_time && log.end_time && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{log.start_time.substring(0, 5)} - {log.end_time.substring(0, 5)}</span>
                  </div>
                )}
                {log.duration_minutes && (
                  <span className="text-gray-500">
                    {Math.floor(log.duration_minutes)} min
                  </span>
                )}
              </div>
            </div>
          </div>

          {!isCompact && log.description && (
            <p className="text-gray-700 mb-3">{log.description}</p>
          )}

          {!isCompact && log.notes && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Notes:</p>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{log.notes}</p>
            </div>
          )}

          {isCompact && (log.description || log.notes) && (
            <p className="text-sm text-gray-700 mb-2">
              {(() => {
                const text = log.description || log.notes || '';
                return text.length > 120 ? `${text.slice(0, 120)}…` : text;
              })()}
            </p>
          )}

          {!isCompact && log.milestone_achieved && log.milestone_name && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-semibold text-yellow-900 mb-1">🎉 Milestone: {log.milestone_name}</p>
              {log.milestone_description && (
                <p className="text-sm text-yellow-800">{log.milestone_description}</p>
              )}
            </div>
          )}

          {log.photos && log.photos.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <ImageIcon className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {log.photos.length} photo{log.photos.length !== 1 ? 's' : ''}
                </span>
              </div>
              {!isCompact && (
                <div className="grid grid-cols-4 gap-2">
                  {log.photos.slice(0, 4).map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Activity photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-gray-200"
                    />
                  ))}
                  {log.photos.length > 4 && (
                    <div className="w-full h-20 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                      <span className="text-xs text-gray-600">+{log.photos.length - 4} more</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {log.is_editable && (
                <span className="text-green-600">Editable</span>
              )}
              {!log.is_editable && (
                <span className="text-gray-400">Locked (24h expired)</span>
              )}
            </div>
            {onLogClick && (
              <span className={`font-medium text-primary-blue hover:text-light-blue-cyan transition-colors ${isCompact ? 'text-xs' : 'text-sm'}`}>
                View Details →
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

