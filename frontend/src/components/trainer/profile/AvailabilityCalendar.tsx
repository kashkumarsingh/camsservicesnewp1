'use client';

import React, { useState } from 'react';
import { trainerProfileRepository } from '@/infrastructure/http/trainer/TrainerProfileRepository';
import type { TrainerProfile, AvailabilityPreference, UpdateAvailabilityRequest } from '@/core/application/trainer/types';
import { Save, Plus, X, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';

interface AvailabilityCalendarProps {
  profile: TrainerProfile;
  onUpdate: (preferences: any[], notes?: string | null) => void;
  onError: (error: string) => void;
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export default function AvailabilityCalendar({ profile, onUpdate, onError }: AvailabilityCalendarProps) {
  const [availabilityPreferences, setAvailabilityPreferences] = useState<AvailabilityPreference[]>(
    profile.availability_preferences || []
  );
  const [availabilityNotes, setAvailabilityNotes] = useState(profile.availability_notes || '');
  const [saving, setSaving] = useState(false);

  const getDayPreference = (day: string): AvailabilityPreference | undefined => {
    return availabilityPreferences.find((pref) => pref.day === day);
  };

  const addTimeSlot = (day: string) => {
    const existing = getDayPreference(day);
    const newSlot = { start: '09:00', end: '17:00' };

    if (existing) {
      setAvailabilityPreferences(
        availabilityPreferences.map((pref) =>
          pref.day === day
            ? { ...pref, time_slots: [...pref.time_slots, newSlot] }
            : pref
        )
      );
    } else {
      setAvailabilityPreferences([...availabilityPreferences, { day, time_slots: [newSlot] }]);
    }
  };

  const removeTimeSlot = (day: string, index: number) => {
    const existing = getDayPreference(day);
    if (!existing) return;

    if (existing.time_slots.length === 1) {
      // Remove entire day if last slot
      setAvailabilityPreferences(availabilityPreferences.filter((pref) => pref.day !== day));
    } else {
      // Remove specific slot
      setAvailabilityPreferences(
        availabilityPreferences.map((pref) =>
          pref.day === day
            ? { ...pref, time_slots: pref.time_slots.filter((_, i) => i !== index) }
            : pref
        )
      );
    }
  };

  const updateTimeSlot = (day: string, index: number, field: 'start' | 'end', value: string) => {
    setAvailabilityPreferences(
      availabilityPreferences.map((pref) =>
        pref.day === day
          ? {
              ...pref,
              time_slots: pref.time_slots.map((slot, i) =>
                i === index ? { ...slot, [field]: value } : slot
              ),
            }
          : pref
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data: UpdateAvailabilityRequest = {
        availability_preferences: availabilityPreferences,
        availability_notes: availabilityNotes || null,
      };
      const result = await trainerProfileRepository.updateAvailability(data);
      onUpdate(result.availability_preferences, result.availability_notes);
    } catch (err: any) {
      onError(err.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Availability</h3>
        <p className="text-sm text-gray-600 mb-6">
          Set your available time slots for each day of the week. You can add multiple time slots per day.
        </p>

        <div className="space-y-4">
          {DAYS.map((day) => {
            const dayPreference = getDayPreference(day);
            const timeSlots = dayPreference?.time_slots || [];

            return (
              <div key={day} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{DAY_LABELS[day]}</h4>
                  <Button
                    type="button"
                    onClick={() => addTimeSlot(day)}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Slot
                  </Button>
                </div>

                {timeSlots.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">No availability set</p>
                ) : (
                  <div className="space-y-2">
                    {timeSlots.map((slot, index) => (
                      <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 flex-1">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(day, index, 'start', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(day, index, 'end', e.target.value)}
                            className="px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTimeSlot(day, index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Availability Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Availability Notes
        </label>
        <textarea
          value={availabilityNotes}
          onChange={(e) => setAvailabilityNotes(e.target.value)}
          rows={4}
          placeholder="Any additional notes about your availability (e.g., 'Available for emergency sessions', 'Prefer morning sessions')"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
        />
      </div>

      {/* Note: Save button is in modal footer */}
    </form>
  );
}

