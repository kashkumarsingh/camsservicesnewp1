'use client';

import React, { useState, useEffect } from 'react';
import { trainerActivityRepository } from '@/infrastructure/http/trainer/TrainerActivityRepository';
import type {
  SessionActivityInfo,
  SessionActivity,
  AvailableActivity,
  AssignActivityRequest,
} from '@/core/application/trainer/types';
import { Plus, X, CheckCircle, Clock, AlertCircle, Settings } from 'lucide-react';
import Button from '@/components/ui/Button';
import ActivityOverrideModal from './ActivityOverrideModal';
import { EmptyState } from '@/components/dashboard/universal/EmptyState';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface SessionActivityPlannerProps {
  scheduleId: number;
  onActivityConfirmed?: () => void;
}

export default function SessionActivityPlanner({
  scheduleId,
  onActivityConfirmed,
}: SessionActivityPlannerProps) {
  const [schedule, setSchedule] = useState<SessionActivityInfo | null>(null);
  const [activities, setActivities] = useState<SessionActivity[]>([]);
  const [availableActivities, setAvailableActivities] = useState<AvailableActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  
  // Assignment form state
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<number | ''>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  
  // Confirmation state
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchSessionActivities();
  }, [scheduleId]);

  const fetchSessionActivities = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await trainerActivityRepository.getSessionActivities(scheduleId);
      setSchedule(data.schedule);
      setActivities(data.activities);
      setAvailableActivities(data.availableActivities);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load session activities';
      setError(errorMessage);
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignActivity = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedActivityId) {
      setError('Please select an activity');
      setSuccess(null);
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);
    try {
      const request: AssignActivityRequest = {
        activity_id: selectedActivityId as number,
        notes: assignmentNotes.trim() || undefined,
      };

      await trainerActivityRepository.assignActivity(scheduleId, request);
      setSuccess('Activity assigned successfully');
      setError(null);
      setShowAssignForm(false);
      setSelectedActivityId('');
      setAssignmentNotes('');
      fetchSessionActivities(); // Refresh data
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to assign activity');
      setSuccess(null);
    } finally {
      setAssigning(false);
    }
  };

  const handleConfirmActivities = async () => {
    if (activities.length === 0) {
      setError('Please assign at least one activity before confirming');
      setSuccess(null);
      return;
    }

    if (!window.confirm('Are you sure you want to confirm these activities? The parent will be notified.')) {
      return;
    }

    setConfirming(true);
    setError(null);
    setSuccess(null);
    try {
      await trainerActivityRepository.confirmActivities(scheduleId, {
        notes: 'Activities confirmed for this session',
      });
      setSuccess('Activities confirmed! Parent has been notified.');
      setError(null);
      fetchSessionActivities(); // Refresh data
      onActivityConfirmed?.();
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to confirm activities');
      setSuccess(null);
    } finally {
      setConfirming(false);
    }
  };

  const handleRemoveActivity = async (activityId: number) => {
    if (!window.confirm('Are you sure you want to remove this activity?')) {
      return;
    }

    setError(null);
    setSuccess(null);
    try {
      await trainerActivityRepository.removeActivity(scheduleId, activityId);
      setSuccess('Activity removed successfully');
      setError(null);
      fetchSessionActivities(); // Refresh data
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove activity');
      setSuccess(null);
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'assigned':
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading activities...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center py-8 text-red-600">
          {error || 'Failed to load session activities'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Activity Planning</h3>
          <p className="text-sm text-gray-600 mt-1">
            {new Date(schedule.date).toLocaleDateString('en-GB', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} • {schedule.start_time} - {schedule.end_time}
          </p>
        </div>
        {schedule.package.allow_activity_override && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverrideModal(true)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Override Count
          </Button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {success}
          </p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </p>
        </div>
      )}

      {/* Activity Count Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="text-lg font-semibold text-gray-900">{schedule.duration_hours} hours</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Activity Count</p>
            <p className="text-lg font-semibold text-gray-900">
              {schedule.activity_count} {schedule.is_activity_override && (
                <span className="text-xs text-orange-600 ml-1">(Overridden)</span>
              )}
            </p>
            {schedule.is_activity_override && schedule.activity_override_reason && (
              <p className="text-xs text-gray-500 mt-1">{schedule.activity_override_reason}</p>
            )}
          </div>
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <p className="text-lg font-semibold text-gray-900 capitalize">{schedule.activity_status}</p>
          </div>
        </div>
        {schedule.is_activity_override && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Calculated:</strong> {schedule.calculated_activity_count} activities
              ({schedule.duration_hours} hours ÷ {schedule.package.hours_per_activity} hours per activity)
            </p>
          </div>
        )}
      </div>

      {/* Assigned Activities */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-900">Assigned Activities</h4>
          {schedule.activity_status !== 'confirmed' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAssignForm(!showAssignForm)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              {showAssignForm ? 'Cancel' : 'Add Activity'}
            </Button>
          )}
        </div>

        {activities.length === 0 ? (
          <EmptyState
            title={EMPTY_STATE.NO_ACTIVITIES_ASSIGNED_YET.title}
            message={EMPTY_STATE.NO_ACTIVITIES_ASSIGNED_YET.message}
            className="py-8 border-2 border-dashed border-gray-300 rounded-lg"
          />
        ) : (
          <div className="space-y-3">
            {activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h5 className="font-semibold text-gray-900">{activity.name}</h5>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getActivityStatusColor(activity.assignment_status)}`}>
                      {getActivityStatusIcon(activity.assignment_status)}
                      {activity.assignment_status}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                  )}
                  {activity.notes && (
                    <p className="text-sm text-gray-500 italic">Notes: {activity.notes}</p>
                  )}
                  {activity.confirmed_at && (
                    <p className="text-xs text-gray-500 mt-2">
                      Confirmed: {new Date(activity.confirmed_at).toLocaleString()}
                    </p>
                  )}
                </div>
                {schedule.activity_status !== 'confirmed' && (
                  <button
                    onClick={() => handleRemoveActivity(activity.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Remove activity"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Assign Activity Form */}
        {showAssignForm && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <form onSubmit={handleAssignActivity} className="space-y-4">
              <div>
                <label htmlFor="activity_select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Activity *
                </label>
                <select
                  id="activity_select"
                  value={selectedActivityId}
                  onChange={(e) => setSelectedActivityId(parseInt(e.target.value) || '')}
                  required
                  disabled={assigning}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">Choose an activity...</option>
                  {availableActivities.map((activity) => (
                    <option key={activity.id} value={activity.id}>
                      {activity.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="assignment_notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  id="assignment_notes"
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  disabled={assigning}
                  placeholder="Add any notes about this activity for this session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-primary-blue disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={assigning || !selectedActivityId}
                >
                  {assigning ? 'Assigning...' : 'Assign Activity'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setShowAssignForm(false);
                    setSelectedActivityId('');
                    setAssignmentNotes('');
                  }}
                  disabled={assigning}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Confirm Button */}
      {schedule.activity_status !== 'confirmed' && activities.length > 0 && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Once confirmed, the parent will be automatically notified about the activities for this session.
              </p>
            </div>
            <Button
              onClick={handleConfirmActivities}
              disabled={confirming || activities.length === 0}
              className="flex items-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              {confirming ? 'Confirming...' : 'Confirm Activities'}
            </Button>
          </div>
        </div>
      )}

      {/* Confirmed Status */}
      {schedule.activity_status === 'confirmed' && (
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-900">Activities Confirmed</p>
              <p className="text-xs text-green-700">
                Parent has been notified. Confirmed at: {schedule.activity_confirmed_at ? new Date(schedule.activity_confirmed_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Override Modal */}
      {schedule && (
        <ActivityOverrideModal
          schedule={schedule}
          isOpen={showOverrideModal}
          onClose={() => setShowOverrideModal(false)}
          onSuccess={() => {
            fetchSessionActivities();
            setShowOverrideModal(false);
          }}
        />
      )}
    </div>
  );
}

