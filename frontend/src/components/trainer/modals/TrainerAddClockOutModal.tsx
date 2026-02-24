'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { X, Clock } from 'lucide-react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { trainerTimeEntryRepository } from '@/infrastructure/http/trainer/TrainerTimeEntryRepository';
import { toastManager } from '@/utils/toast';

interface ScheduleSummary {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  booking?: {
    reference?: string;
    package?: { name?: string };
    participants?: Array<{ child?: { name?: string }; first_name?: string; last_name?: string }>;
  };
}

function formatTime(t: string): string {
  if (!t || t.length < 5) return t || '';
  return t.slice(0, 5);
}

function formatDate(d: string): string {
  try {
    return new Date(d + 'T12:00:00').toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export interface TrainerAddClockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string | null;
  onSuccess?: () => void;
}

export function TrainerAddClockOutModal({
  isOpen,
  onClose,
  scheduleId,
  onSuccess,
}: TrainerAddClockOutModalProps) {
  const [schedule, setSchedule] = useState<ScheduleSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recordedAt, setRecordedAt] = useState('');
  const [notes, setNotes] = useState('');

  const fetchSchedule = useCallback(async () => {
    if (!scheduleId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data?: { schedule?: ScheduleSummary }; schedule?: ScheduleSummary }>(
        API_ENDPOINTS.TRAINER_SCHEDULE_BY_ID(scheduleId)
      );
      const s = res.data?.data?.schedule ?? res.data?.schedule ?? null;
      setSchedule(s ?? null);
      if (s?.date && s?.end_time) {
        const endIso = `${s.date}T${s.end_time}`;
        setRecordedAt(endIso.slice(0, 16));
      } else {
        const now = new Date();
        setRecordedAt(now.toISOString().slice(0, 16));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    if (isOpen && scheduleId) fetchSchedule();
    if (!isOpen) {
      setSchedule(null);
      setError(null);
      setNotes('');
    }
  }, [isOpen, scheduleId, fetchSchedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleId || !recordedAt) return;
    setSubmitting(true);
    setError(null);
    try {
      const iso = new Date(recordedAt).toISOString();
      await trainerTimeEntryRepository.clockOut(Number(scheduleId), {
        recorded_at: iso,
        notes: notes.trim() || undefined,
      });
      toastManager.success('Clock-out time recorded');
      onSuccess?.();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save clock-out');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const childNames = schedule?.booking?.participants
    ?.map((p) => p.child?.name ?? [p.first_name, p.last_name].filter(Boolean).join(' '))
    .filter(Boolean)
    .join(', ') ?? 'Session';

  return (
    <>
      <div
        className="fixed inset-0 z-overlay bg-slate-900/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        className="fixed left-1/2 top-1/2 z-overlay w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-clock-out-title"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-700">
          <h2 id="add-clock-out-title" className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" aria-hidden />
            Add clock-out time
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          You marked this session as completed but did not clock out. Please enter when you actually clocked out.
        </p>
        {loading && (
          <div className="mt-3 space-y-2 animate-pulse" aria-busy="true" aria-label="Loading session">
            <div className="h-4 w-full max-w-[12rem] bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        )}
        {error && !loading && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            {error}
          </div>
        )}
        {schedule && !loading && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-700 dark:bg-slate-800/30">
              <p className="font-medium text-slate-900 dark:text-slate-100">{childNames}</p>
              <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {formatDate(schedule.date)} · {formatTime(schedule.start_time)} – {formatTime(schedule.end_time)}
              </p>
            </div>
            <div>
              <label htmlFor="clock-out-recorded-at" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                When did you clock out?
              </label>
              <input
                id="clock-out-recorded-at"
                type="datetime-local"
                required
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label htmlFor="clock-out-notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Notes (optional)
              </label>
              <textarea
                id="clock-out-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Left venue at 12:05"
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 dark:bg-indigo-500 dark:hover:bg-indigo-600"
              >
                {submitting ? 'Saving…' : 'Save clock-out'}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
}
