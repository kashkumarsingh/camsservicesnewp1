'use client';

import React, { useState, useEffect } from 'react';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import type { TrainerSchedule, TrainerParticipant, MarkAttendanceRequest } from '@/core/application/trainer/types';
import { CheckCircle, XCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';

interface AttendanceModalProps {
  schedule: TrainerSchedule;
  participants: TrainerParticipant[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AttendanceModal({
  schedule,
  participants,
  isOpen,
  onClose,
  onSuccess,
}: AttendanceModalProps) {
  const [attendance, setAttendance] = useState<Record<number, {
    attended: boolean;
    arrival_time: string;
    departure_time: string;
    notes: string;
  }>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize attendance state for all participants
      const initialAttendance: Record<number, {
        attended: boolean;
        arrival_time: string;
        departure_time: string;
        notes: string;
      }> = {};
      
      participants.forEach((participant) => {
        // Check if attendance already exists
        const existingAttendance = schedule.attendance?.find(
          a => a.booking_participant_id === participant.id
        );
        
        initialAttendance[participant.id] = {
          attended: existingAttendance?.attended ?? true,
          arrival_time: existingAttendance?.arrival_time?.substring(0, 5) ?? schedule.start_time.substring(0, 5),
          departure_time: existingAttendance?.departure_time?.substring(0, 5) ?? schedule.end_time.substring(0, 5),
          notes: existingAttendance?.notes ?? '',
        };
      });
      
      setAttendance(initialAttendance);
      setError(null);
    }
  }, [isOpen, participants, schedule]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      const attendanceData: MarkAttendanceRequest = {
        participants: participants.map((participant) => ({
          participant_id: participant.id,
          attended: attendance[participant.id]?.attended ?? true,
          arrival_time: attendance[participant.id]?.arrival_time || undefined,
          departure_time: attendance[participant.id]?.departure_time || undefined,
          notes: attendance[participant.id]?.notes || undefined,
        })),
      };

      await trainerScheduleRepository.markAttendance(schedule.id, attendanceData);

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to mark attendance:', err);
      setError(err.message || 'Failed to mark attendance');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Mark Attendance"
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button onClick={onClose} variant="outline" disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Attendance'}
          </Button>
        </div>
      }
    >
      <div>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Date: {new Date(schedule.date).toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-sm text-gray-600">
              Time: {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {participants.map((participant) => (
              <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{participant.name}</h3>
                    {participant.age && (
                      <p className="text-sm text-gray-600">Age: {participant.age}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setAttendance(prev => ({
                          ...prev,
                          [participant.id]: {
                            ...prev[participant.id],
                            attended: true,
                          },
                        }));
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        attendance[participant.id]?.attended
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title="Attended"
                    >
                      <CheckCircle className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => {
                        setAttendance(prev => ({
                          ...prev,
                          [participant.id]: {
                            ...prev[participant.id],
                            attended: false,
                          },
                        }));
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        !attendance[participant.id]?.attended
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                      }`}
                      title="Absent"
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {attendance[participant.id]?.attended && (
                  <div className="space-y-3 mt-3 pt-3 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Arrival Time
                        </label>
                        <input
                          type="time"
                          value={attendance[participant.id]?.arrival_time || ''}
                          onChange={(e) => {
                            setAttendance(prev => ({
                              ...prev,
                              [participant.id]: {
                                ...prev[participant.id],
                                arrival_time: e.target.value,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Departure Time
                        </label>
                        <input
                          type="time"
                          value={attendance[participant.id]?.departure_time || ''}
                          onChange={(e) => {
                            setAttendance(prev => ({
                              ...prev,
                              [participant.id]: {
                                ...prev[participant.id],
                                departure_time: e.target.value,
                              },
                            }));
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes (optional)
                      </label>
                      <textarea
                        value={attendance[participant.id]?.notes || ''}
                        onChange={(e) => {
                          setAttendance(prev => ({
                            ...prev,
                            [participant.id]: {
                              ...prev[participant.id],
                              notes: e.target.value,
                            },
                          }));
                        }}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-blue focus:border-transparent"
                        placeholder="Add notes about this participant's attendance..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
      </div>
    </BaseModal>
  );
}

