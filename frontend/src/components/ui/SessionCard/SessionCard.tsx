'use client';

import React from 'react';
import { Calendar, Clock, Edit2, Trash2, User, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { formatHours } from '@/utils/formatHours';
import moment from 'moment';
import SessionCancelDeadline from '@/components/sessions/SessionCancelDeadline';

export interface Activity {
  id: number;
  name: string;
  duration?: number;
  category?: string;
}

export interface Trainer {
  id?: number | string;
  name: string;
  specialty?: string;
  avatar?: string;
}

export interface SessionCardProps {
  /**
   * Session date (YYYY-MM-DD format)
   */
  date: string;
  /**
   * Session start time (HH:mm format)
   */
  startTime: string;
  /**
   * Session end time (HH:mm format)
   */
  endTime: string;
  /**
   * Session duration in hours
   */
  duration: number;
  /**
   * Activities for this session
   */
  activities?: Activity[];
  /**
   * Trainer information
   */
  trainer?: Trainer;
  /**
   * Whether this is a trainer's choice session (no activities)
   */
  trainerChoice?: boolean;
  /**
   * Session status
   */
  status?: 'upcoming' | 'past' | 'cancelled';
  /**
   * Whether session can be edited
   */
  canEdit?: boolean;
  /**
   * Whether session can be deleted
   */
  canDelete?: boolean;
  /**
   * Whether session is currently being edited
   */
  isEditing?: boolean;
  /**
   * Whether session is within 1 hour (locked)
   */
  isLocked?: boolean;
  /**
   * Edit handler
   */
  onEdit?: () => void;
  /**
   * Delete handler
   */
  onDelete?: () => void;
  /**
   * Trainer click handler
   */
  onTrainerClick?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Optional notes/description
   */
  notes?: string;
}

/**
 * SessionCard Component
 * 
 * Reusable card component for displaying session information with activities, trainer, and actions.
 * Follows Clean Architecture principles and WCAG 2.1 AA accessibility standards.
 * 
 * @example
 * ```tsx
 * <SessionCard
 *   date="2025-12-15"
 *   startTime="10:00"
 *   endTime="12:00"
 *   duration={2}
 *   activities={[{ id: 1, name: "Swimming" }]}
 *   trainer={{ name: "John Doe", specialty: "Swimming" }}
 *   status="upcoming"
 *   canEdit={true}
 *   onEdit={() => handleEdit()}
 *   onDelete={() => handleDelete()}
 * />
 * ```
 */
const SessionCard: React.FC<SessionCardProps> = ({
  date,
  startTime,
  endTime,
  duration,
  activities = [],
  trainer,
  trainerChoice = false,
  status = 'upcoming',
  canEdit = false,
  canDelete = false,
  isEditing = false,
  isLocked = false,
  onEdit,
  onDelete,
  onTrainerClick,
  className = '',
  notes,
}) => {
  const isPast = status === 'past';
  const totalActivities = activities.length;
  const isTrainerChoiceSession = trainerChoice || totalActivities === 0;

  const getActivityColor = (category?: string) => {
    if (!category) return 'bg-gray-500';
    const lower = category.toLowerCase();
    if (lower.includes('outdoor') || lower.includes('extreme')) return 'bg-orange-500';
    if (lower.includes('water')) return 'bg-blue-500';
    if (lower.includes('indoor') || lower.includes('technical')) return 'bg-yellow-600';
    if (lower.includes('contact') || lower.includes('sport')) return 'bg-green-600';
    return 'bg-gray-500';
  };

  const formattedDate = moment(date).format('dddd, MMMM D, YYYY');
  const formattedTime = `${startTime} - ${endTime}`;

  return (
    <div
      className={`border border-gray-200 rounded-lg p-4 sm:p-6 hover:border-gray-300 transition-colors shadow-sm ${
        isEditing ? 'ring-2 ring-blue-300 ring-offset-2' : ''
      } ${isPast ? 'opacity-60' : ''} ${className}`}
      role="article"
      aria-label={`Session on ${formattedDate} from ${formattedTime}`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-base sm:text-lg flex items-center gap-2">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" aria-hidden="true" />
            <span className="break-words">{formattedDate}</span>
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            {formatHours(duration)} hour session •{' '}
            {isTrainerChoiceSession ? "Trainer's Choice" : `${totalActivities} ${totalActivities === 1 ? 'activity' : 'activities'}`}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {canEdit && !isEditing && !isLocked && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              icon={<Edit2 className="w-4 h-4" />}
              aria-label={`Edit session on ${formattedDate}`}
            >
              Edit
            </Button>
          )}
          {canDelete && !isLocked && (
            <Button
              onClick={onDelete}
              variant="outline"
              size="sm"
              icon={<Trash2 className="w-4 h-4" />}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
              aria-label={`Cancel session on ${formattedDate}`}
            >
              Cancel
            </Button>
          )}
          {isLocked && (
            <span
              className="px-4 py-2 text-sm text-gray-500 rounded-lg border border-gray-300 cursor-not-allowed flex items-center justify-center min-h-[36px]"
              aria-label="Session is locked and cannot be edited"
            >
              Locked
            </span>
          )}
          {isPast && (
            <span
              className="px-4 py-2 text-sm text-gray-500 rounded-lg border border-gray-300 cursor-not-allowed"
              aria-label="This is a past session"
            >
              Past
            </span>
          )}
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Activities */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Activities</h4>
          <div className="space-y-1.5">
            {isTrainerChoiceSession ? (
              <div className="flex items-center gap-2 text-sm bg-blue-50 p-2 rounded" role="status" aria-label="Trainer's choice session">
                <span className="text-blue-700 font-medium">Trainer's Choice</span>
              </div>
            ) : (
              activities.map((activity, index) => {
                const activityColor = getActivityColor(activity.category);
                return (
                  <div
                    key={`activity-${activity.id || index}`}
                    className="flex items-center gap-2 text-sm"
                    aria-label={`Activity: ${activity.name}`}
                  >
                    <div className={`w-1 h-6 rounded-full ${activityColor}`} aria-hidden="true" />
                    <span className="flex-1 text-gray-700">{activity.name}</span>
                    {activity.duration && (
                      <span className="text-gray-500" aria-label={`Duration: ${activity.duration} hours`}>
                        {activity.duration}h
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Trainer */}
        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Trainer</h4>
          {trainer ? (
            <div className="space-y-2">
              <button
                onClick={onTrainerClick}
                className="w-full flex items-center gap-3 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors group text-left"
                aria-label={`View trainer: ${trainer.name}`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {trainer.avatar || (trainer.name ? trainer.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'AA')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm group-hover:text-blue-600 transition-colors truncate">
                    {trainer.name}
                  </p>
                  {trainer.specialty && (
                    <p className="text-xs text-gray-600 truncate">{trainer.specialty}</p>
                  )}
                </div>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
              <div className="w-10 h-10 rounded-full bg-gray-400 text-white flex items-center justify-center font-semibold text-sm flex-shrink-0">
                AA
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Auto-assigned</p>
                <p className="text-xs text-gray-600">Best match based on availability</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Time Display + Cancellation Deadline */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" aria-hidden="true" />
          <span className="font-medium" aria-label={`Time: ${formattedTime}`}>
            {formattedTime}
          </span>
        </div>
        {/* Zero-confusion cancellation messaging based on 24-hour policy */}
        <SessionCancelDeadline
          session={{
            date,
            startTime,
            endTime,
          }}
        />
      </div>

      {/* Notes */}
      {notes && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs sm:text-sm text-gray-600" aria-label={`Notes: ${notes}`}>
            {notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default SessionCard;
