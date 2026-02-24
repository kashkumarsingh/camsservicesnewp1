'use client';

import React, { useState, useEffect } from 'react';
import { trainerActivityLogRepository } from '@/infrastructure/http/trainer/TrainerActivityLogRepository';
import type { CreateActivityLogRequest, UpdateActivityLogRequest, ActivityLog, TrainerBooking } from '@/core/application/trainer/types';
import { Plus, X, Upload, Clock, Calendar, User, CheckCircle, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import PhotoUpload from './PhotoUpload';

interface ActivityLogFormProps {
  childId: number;
  childName: string;
  bookingId?: number;
  bookingScheduleId?: number;
  onSuccess?: (log: ActivityLog) => void;
  onCancel?: () => void;
  initialData?: Partial<ActivityLog>;
  formId?: string;
  showActions?: boolean;
  showChildHeader?: boolean;
}

export default function ActivityLogForm({
  childId,
  childName,
  bookingId,
  bookingScheduleId,
  onSuccess,
  onCancel,
  initialData,
  formId,
  showActions = true,
  showChildHeader = true,
}: ActivityLogFormProps) {
  const [formData, setFormData] = useState<CreateActivityLogRequest>({
    child_id: childId,
    booking_id: bookingId,
    booking_schedule_id: bookingScheduleId,
    activity_name: initialData?.activity_name || '',
    description: initialData?.description || '',
    notes: initialData?.notes || '',
    behavioral_observations: initialData?.behavioral_observations || '',
    achievements: initialData?.achievements || '',
    challenges: initialData?.challenges || '',
    status: initialData?.status || 'in_progress',
    activity_date: initialData?.activity_date || new Date().toISOString().split('T')[0],
    start_time: initialData?.start_time?.substring(0, 5) || '',
    end_time: initialData?.end_time?.substring(0, 5) || '',
    duration_minutes: initialData?.duration_minutes || undefined,
    photos: initialData?.photos || [],
    videos: initialData?.videos || [],
    consent_photography: initialData?.consent_photography || false,
    milestone_achieved: initialData?.milestone_achieved || false,
    milestone_name: initialData?.milestone_name || '',
    milestone_description: initialData?.milestone_description || '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>(formData.photos || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dataToSubmit: CreateActivityLogRequest = {
        ...formData,
        photos: uploadedPhotos,
        start_time: formData.start_time || undefined,
        end_time: formData.end_time || undefined,
      };

      let response: { activityLog: ActivityLog };
      if (initialData?.id) {
        // Update existing log
        const updateResponse = await trainerActivityLogRepository.update(initialData.id, dataToSubmit);
        response = { activityLog: updateResponse.activityLog };
      } else {
        // Create new log
        response = await trainerActivityLogRepository.create(dataToSubmit);
      }

      if (onSuccess) {
        onSuccess(response.activityLog);
      }
    } catch (err: any) {
      console.error('Failed to save activity log:', err);
      setError(err.message || 'Failed to save activity log');
    } finally {
      setSaving(false);
    }
  };

  const calculateDuration = () => {
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}:00`);
      const end = new Date(`2000-01-01T${formData.end_time}:00`);
      const diff = (end.getTime() - start.getTime()) / (1000 * 60); // minutes
      if (diff > 0) {
        setFormData(prev => ({ ...prev, duration_minutes: diff }));
      }
    }
  };

  useEffect(() => {
    if (formData.start_time && formData.end_time) {
      calculateDuration();
    }
  }, [formData.start_time, formData.end_time]);

  return (
    <form id={formId} onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Child Info (optional – can be hidden when header shows child name) */}
      {showChildHeader && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-900">
            <User className="h-5 w-5" />
            <span className="font-semibold">Child: {childName}</span>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.activity_name}
            onChange={(e) => setFormData(prev => ({ ...prev, activity_name: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="e.g., Art and Craft Session"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.activity_date}
              onChange={(e) => setFormData(prev => ({ ...prev, activity_date: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            >
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="needs_attention">Needs Attention</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, duration_minutes: e.target.value ? parseFloat(e.target.value) : undefined }))}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
              placeholder="Auto-calculated"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Brief description of the activity..."
          />
        </div>
      </div>

      {/* Notes & Observations */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Notes & Observations</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Activity Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Add notes about the activity..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Behavioral Observations
          </label>
          <textarea
            value={formData.behavioral_observations}
            onChange={(e) => setFormData(prev => ({ ...prev, behavioral_observations: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Observe and note any behavioral patterns..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Achievements
          </label>
          <textarea
            value={formData.achievements}
            onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Document achievements and positive moments..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Challenges
          </label>
          <textarea
            value={formData.challenges}
            onChange={(e) => setFormData(prev => ({ ...prev, challenges: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
            placeholder="Note any challenges faced during the activity..."
          />
        </div>
      </div>

      {/* Milestone */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="milestone_achieved"
            checked={formData.milestone_achieved}
            onChange={(e) => setFormData(prev => ({ ...prev, milestone_achieved: e.target.checked }))}
            className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
          />
          <label htmlFor="milestone_achieved" className="text-sm font-medium text-gray-700">
            Milestone Achieved
          </label>
        </div>

        {formData.milestone_achieved && (
          <div className="space-y-3 pl-6 border-l-2 border-blue-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone Name
              </label>
              <input
                type="text"
                value={formData.milestone_name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="e.g., First Independent Drawing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Milestone Description
              </label>
              <textarea
                value={formData.milestone_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, milestone_description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                placeholder="Describe the milestone achievement..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos
        </label>
        <PhotoUpload
          activityLogId={initialData?.id}
          uploadedPhotos={uploadedPhotos}
          onPhotosChange={setUploadedPhotos}
        />
        <div className="mt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="consent_photography"
            checked={formData.consent_photography}
            onChange={(e) => setFormData(prev => ({ ...prev, consent_photography: e.target.checked }))}
            className="w-4 h-4 text-primary-blue border-gray-300 rounded focus:ring-primary-blue"
          />
          <label htmlFor="consent_photography" className="text-sm text-gray-700">
            Photography consent obtained
          </label>
        </div>
      </div>

      {/* Form Actions */}
      {showActions && (
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          {onCancel && (
            <Button type="button" onClick={onCancel} variant="outline" disabled={saving}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={saving || !formData.activity_name.trim()}>
            {saving ? 'Saving...' : initialData ? 'Update Activity Log' : 'Create Activity Log'}
          </Button>
        </div>
      )}
    </form>
  );
}

