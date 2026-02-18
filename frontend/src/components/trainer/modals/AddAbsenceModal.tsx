'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/Modal';

export const ABSENCE_REASONS = [
  { value: '', label: 'No reason' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'sick', label: 'Sick leave' },
  { value: 'training', label: 'Training' },
  { value: 'other', label: 'Other' },
] as const;

interface AddAbsenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Callback with from, to (YYYY-MM-DD), and optional reason. Parent should submit and close modal on success. */
  onConfirm: (from: string, to: string, reason?: string) => void | Promise<void>;
  /** Optional: initial month for default date range (YYYY-MM). */
  currentMonth?: string;
  /** Optional: prefill from date (e.g. when opened from availability panel). */
  initialFrom?: string;
  /** Optional: prefill to date (e.g. when opened from availability panel). */
  initialTo?: string;
}

/**
 * Add Absence Modal – block a date range as unavailable.
 * Used from trainer dashboard when "Set my availability" is expanded.
 * Reason is for user reference only (not persisted by current API).
 */
export default function AddAbsenceModal({
  isOpen,
  onClose,
  onConfirm,
  currentMonth,
  initialFrom,
  initialTo,
}: AddAbsenceModalProps) {
  const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
  const defaultEnd = currentMonth
    ? moment(currentMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
    : moment().add(1, 'month').format('YYYY-MM-DD');

  const [from, setFrom] = useState(initialFrom ?? tomorrow);
  const [to, setTo] = useState(initialTo ?? defaultEnd);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) {
      setFrom(initialFrom ?? moment().add(1, 'day').format('YYYY-MM-DD'));
      setTo(initialTo ?? (currentMonth
        ? moment(currentMonth, 'YYYY-MM').endOf('month').format('YYYY-MM-DD')
        : moment().add(1, 'month').format('YYYY-MM-DD')));
      setReason('');
    }
  }, [isOpen, currentMonth, initialFrom, initialTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fromD = moment(from, 'YYYY-MM-DD');
    const toD = moment(to, 'YYYY-MM-DD');
    const toUse = toD.isBefore(fromD) ? from : to;
    const fromVal = from;
    if (toD.isBefore(fromD)) setTo(from);
    setSubmitting(true);
    try {
      await Promise.resolve(onConfirm(fromVal, toUse, reason || undefined));
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = tomorrow;

  const modal = (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Add absence"
      size="lg"
      ariaLabel="Add absence"
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => formRef.current?.requestSubmit()}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Add absence'}
          </Button>
        </div>
      }
    >
      <form ref={formRef} id="add-absence-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mark a date range as unavailable. You won’t be assigned sessions on these days. The request is sent for admin approval; once approved, the dates will show as absence on your calendar.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="absence-from" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              From
            </label>
            <input
              id="absence-from"
              type="date"
              value={from}
              min={minDate}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
            />
          </div>
          <div>
            <label htmlFor="absence-to" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              To
            </label>
            <input
              id="absence-to"
              type="date"
              value={to}
              min={from || minDate}
              onChange={(e) => setTo(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="absence-reason" className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Reason <span className="text-gray-400">(optional)</span>
          </label>
          <select
            id="absence-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          >
            {ABSENCE_REASONS.map((r) => (
              <option key={r.value || 'none'} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </form>
    </BaseModal>
  );

  return typeof document !== 'undefined' && isOpen
    ? createPortal(modal, document.body)
    : modal;
}
