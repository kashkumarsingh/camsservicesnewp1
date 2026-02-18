'use client';

import React, { useState, useMemo } from 'react';
import { X, FileText, Loader2, Lock } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import Button from '@/components/ui/Button';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import type { TrainerBooking, CreateNoteRequest } from '@/core/application/trainer/types';
import { toastManager } from '@/utils/toast';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';

interface TrainerCreateSessionNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Trainer's bookings (used to list sessions for note creation) */
  bookings: TrainerBooking[];
  onSuccess?: () => void;
}

type NoteType = 'general' | 'incident' | 'feedback' | 'attendance';

/**
 * Trainer Create Session Note Modal
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Quick-create a session note from dashboard header (select session then add note).
 */
export default function TrainerCreateSessionNoteModal({
  isOpen,
  onClose,
  bookings,
  onSuccess,
}: TrainerCreateSessionNoteModalProps) {
  const [scheduleId, setScheduleId] = useState<number | ''>('');
  const [noteType, setNoteType] = useState<NoteType>('general');
  const [noteText, setNoteText] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Sessions that have already ended (past only). Notes document what happened, so we only allow past sessions. */
  const scheduleOptions = useMemo(() => {
    const now = new Date();
    const options: Array<{ id: number; label: string; date: string }> = [];
    bookings.forEach((b) => {
      (b.schedules || []).forEach((s) => {
        const date = s.date;
        const endTime = s.end_time ? String(s.end_time).slice(0, 5) : '23:59';
        const sessionEnd = new Date(`${date}T${endTime}:00`);
        if (sessionEnd > now) return;
        const start = s.start_time ? String(s.start_time).slice(0, 5) : '';
        const end = s.end_time ? String(s.end_time).slice(0, 5) : '';
        const ref = b.reference || `#${b.id}`;
        const childName = getTrainerChildDisplayName(b.participants?.[0]?.name ?? undefined);
        options.push({
          id: s.id,
          label: `${date} ${start}-${end} · ${childName} (${ref})`,
          date,
        });
      });
    });
    options.sort((a, b) => b.date.localeCompare(a.date));
    return options;
  }, [bookings]);

  const resetForm = () => {
    setScheduleId('');
    setNoteType('general');
    setNoteText('');
    setIsPrivate(false);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (scheduleId === '') {
      next.scheduleId = 'Please select a session.';
    }
    if (!noteText.trim()) {
      next.noteText = 'Please enter your note.';
    } else if (noteText.trim().length < 10) {
      next.noteText = 'Please provide more detail (at least 10 characters).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || scheduleId === '' || isSubmitting) return;

    setIsSubmitting(true);
    setErrors({});
    try {
      const payload: CreateNoteRequest = {
        note: noteText.trim(),
        type: noteType,
        is_private: isPrivate,
      };
      await trainerScheduleRepository.createNote(Number(scheduleId), payload);
      toastManager.success('Session note saved.');
      resetForm();
      onSuccess?.();
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save note.';
      toastManager.error(message);
      setErrors({ submit: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={handleClose} title="Create session note" size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="trainer-note-session" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Session
          </label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Only sessions that have ended can have notes.
          </p>
          <select
            id="trainer-note-session"
            value={scheduleId}
            onChange={(e) => setScheduleId(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent"
            aria-describedby={errors.scheduleId ? 'trainer-note-session-error' : undefined}
          >
            <option value="">Select a session…</option>
            {scheduleOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
          {scheduleOptions.length === 0 && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              No past sessions available. Notes can be added after a session has ended.
            </p>
          )}
          {errors.scheduleId && (
            <p id="trainer-note-session-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.scheduleId}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="trainer-note-type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note type
          </label>
          <select
            id="trainer-note-type"
            value={noteType}
            onChange={(e) => setNoteType(e.target.value as NoteType)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent"
          >
            <option value="general">General</option>
            <option value="incident">Incident</option>
            <option value="feedback">Feedback</option>
            <option value="attendance">Attendance</option>
          </select>
        </div>

        <div>
          <label htmlFor="trainer-note-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Note
          </label>
          <textarea
            id="trainer-note-text"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            rows={4}
            placeholder="Describe what happened, progress, or any follow-up…"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#2C5F8D] focus:border-transparent"
            aria-describedby={errors.noteText ? 'trainer-note-text-error' : undefined}
          />
          {errors.noteText && (
            <p id="trainer-note-text-error" className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
              {errors.noteText}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="trainer-note-private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="h-4 w-4 text-[#2C5F8D] border-gray-300 rounded focus:ring-[#2C5F8D]"
          />
          <label htmlFor="trainer-note-private" className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Lock className="h-3 w-3" />
            Private note (not visible to parents)
          </label>
        </div>

        {errors.submit && (
          <p className="text-sm text-red-600 dark:text-red-400" role="alert">
            {errors.submit}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || scheduleOptions.length === 0}
            icon={isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
          >
            {isSubmitting ? 'Saving…' : 'Save note'}
          </Button>
        </div>
      </form>
    </BaseModal>
  );
}
