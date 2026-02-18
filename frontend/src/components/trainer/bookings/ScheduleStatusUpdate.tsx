'use client';

import React, { useState } from 'react';
import { trainerBookingRepository } from '@/infrastructure/http/trainer/TrainerBookingRepository';
import type { TrainerSchedule } from '@/core/application/trainer/types';
import Button from '@/components/ui/Button';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface ScheduleStatusUpdateProps {
  schedule: TrainerSchedule;
  bookingId: number;
}

export default function ScheduleStatusUpdate({ schedule, bookingId }: ScheduleStatusUpdateProps) {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [notes, setNotes] = useState('');

  const handleStatusUpdate = async (newStatus: 'scheduled' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled') => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);

      await trainerBookingRepository.updateScheduleStatus(bookingId, schedule.id, {
        status: newStatus,
        notes: notes.trim() || undefined,
      });

      setSuccess(true);
      setNotes('');
      
      // Reload page after 1 second to show updated status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Failed to update schedule status:', err);
      setError(err.message || 'Failed to update schedule status');
      setSuccess(false);
    } finally {
      setUpdating(false);
    }
  };

  // Don't show update options for completed or cancelled schedules
  if (schedule.status === 'completed' || schedule.status === 'cancelled') {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-800">Schedule status updated successfully!</p>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor={`notes-${schedule.id}`} className="block text-sm font-medium text-gray-700 mb-1">
          Notes (optional)
        </label>
        <textarea
          id={`notes-${schedule.id}`}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0080FF] focus:border-transparent"
          placeholder="Add notes about this session..."
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {schedule.status !== 'completed' && (
          <Button
            onClick={() => handleStatusUpdate('completed')}
            disabled={updating}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Mark as Completed
          </Button>
        )}

        {schedule.status !== 'cancelled' && (
          <button
            onClick={() => handleStatusUpdate('cancelled')}
            disabled={updating}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <XCircle className="h-4 w-4" />
            Cancel
          </button>
        )}

        {schedule.status !== 'no_show' && (
          <button
            onClick={() => handleStatusUpdate('no_show')}
            disabled={updating}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            Mark as No Show
          </button>
        )}
      </div>
    </div>
  );
}

