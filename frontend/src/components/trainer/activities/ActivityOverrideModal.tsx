'use client';

import React, { useState } from 'react';
import { trainerActivityRepository } from '@/infrastructure/http/trainer/TrainerActivityRepository';
import type { SessionActivityInfo } from '@/core/application/trainer/types';
import { AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';

interface ActivityOverrideModalProps {
  schedule: SessionActivityInfo;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ActivityOverrideModal({
  schedule,
  isOpen,
  onClose,
  onSuccess,
}: ActivityOverrideModalProps) {
  const [activityCount, setActivityCount] = useState(schedule.activity_count);
  const [overrideReason, setOverrideReason] = useState(schedule.activity_override_reason || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!overrideReason.trim() || overrideReason.trim().length < 10) {
      setError('Please provide a reason for the override (minimum 10 characters)');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await trainerActivityRepository.overrideActivityCount(schedule.id, {
        activity_count: activityCount,
        override_reason: overrideReason.trim(),
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to override activity count');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOverride = async () => {
    if (!window.confirm('Are you sure you want to remove the override and reset to calculated value?')) {
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await trainerActivityRepository.removeOverride(schedule.id);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to remove override');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Override Activity Count" size="lg">
      <>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          </div>
        )}

        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 mb-2">
            <strong>Session Duration:</strong> {schedule.duration_hours} hours
          </p>
          <p className="text-sm text-blue-800 mb-2">
            <strong>Calculated Activity Count:</strong> {schedule.calculated_activity_count} activities
            <span className="text-blue-600 ml-2">
              ({schedule.duration_hours} hours ÷ {schedule.package.hours_per_activity} hours per activity)
            </span>
          </p>
          <p className="text-sm text-blue-800">
            <strong>Current Activity Count:</strong> {schedule.activity_count} activities
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="activity_count" className="block text-sm font-medium text-gray-700 mb-1">
              Activity Count *
            </label>
            <input
              id="activity_count"
              type="number"
              min={1}
              max={10}
              value={activityCount}
              onChange={(e) => setActivityCount(parseInt(String(e.target.value), 10) || 1)}
              required
              disabled={saving}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-[#0080FF] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="override_reason" className="block text-sm font-medium text-gray-700 mb-1">
              Override Reason * <span className="text-gray-500">(minimum 10 characters)</span>
            </label>
            <textarea
              id="override_reason"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              rows={4}
              minLength={10}
              maxLength={500}
              required
              disabled={saving}
              placeholder="e.g., Parent requested 6-hour session to count as 1 activity instead of 2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-[#0080FF] disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 10 characters. Explain why you're overriding the calculated activity count.
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="submit"
              disabled={saving || !overrideReason.trim() || overrideReason.trim().length < 10}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save Override'}
            </Button>
            {schedule.is_activity_override && (
              <Button
                type="button"
                variant="outline"
                onClick={handleRemoveOverride}
                disabled={saving}
              >
                Remove Override
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </>
    </BaseModal>
  );
}

