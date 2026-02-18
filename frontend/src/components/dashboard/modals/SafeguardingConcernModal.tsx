'use client';

import React, { useState } from 'react';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import BaseModal from '@/components/ui/Modal/BaseModal';
import type { Child } from '@/core/application/auth/types';

export interface SafeguardingConcernFormData {
  concernType: string;
  description: string;
  childId?: number;
  dateOfConcern?: string;
  contactPreference?: string;
}

const CONCERN_TYPES = [
  { value: '', label: 'Select type…' },
  { value: 'safety', label: 'Safety concern' },
  { value: 'behaviour', label: 'Behaviour or conduct' },
  { value: 'environment', label: 'Environment or venue' },
  { value: 'other', label: 'Other' },
];

interface SafeguardingConcernModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Parent's children (optional – to link concern to a child) */
  children?: Child[];
  onSubmit: (data: SafeguardingConcernFormData) => Promise<void>;
}

/**
 * Safeguarding Concern Modal (Parent Dashboard)
 *
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Form to document and submit safeguarding concerns.
 * Location: frontend/src/components/dashboard/modals/SafeguardingConcernModal.tsx
 *
 * - Modal width: md (Google Calendar-style parent UX).
 * - Required: concern type, description. Optional: child, date, contact preference.
 * - Submit triggers API (or placeholder); on success, close and toast.
 */
export default function SafeguardingConcernModal({
  isOpen,
  onClose,
  children = [],
  onSubmit,
}: SafeguardingConcernModalProps) {
  const [formData, setFormData] = useState<SafeguardingConcernFormData>({
    concernType: '',
    description: '',
    childId: undefined,
    dateOfConcern: '',
    contactPreference: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof SafeguardingConcernFormData, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!formData.concernType.trim()) {
      next.concernType = 'Please select a concern type.';
    }
    if (!formData.description.trim()) {
      next.description = 'Please describe your concern.';
    } else if (formData.description.trim().length < 20) {
      next.description = 'Please provide more detail (at least 20 characters).';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: SafeguardingConcernFormData = {
        concernType: formData.concernType,
        description: formData.description.trim(),
        childId: formData.childId || undefined,
        dateOfConcern: formData.dateOfConcern?.trim() || undefined,
        contactPreference: formData.contactPreference?.trim() || undefined,
      };
      await onSubmit(payload);
      setFormData({ concernType: '', description: '', childId: undefined, dateOfConcern: '', contactPreference: '' });
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Safeguarding concern submit error:', err);
      setErrors({ submit: 'Something went wrong. Please try again or contact us directly.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <ShieldAlert size={20} className="text-amber-500 dark:text-amber-400" aria-hidden />
          Report a safeguarding concern
        </span>
      }
      size="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full justify-end">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="safeguarding-concern-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ShieldAlert size={16} />}
          >
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </Button>
        </div>
      }
    >
      <form id="safeguarding-concern-form" onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-[#5f6368] dark:text-gray-400">
            Your report will be handled by our Designated Safeguarding Lead. Please provide as much detail as you can.
          </p>

          <div>
            <label htmlFor="safeguarding-concern-type" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Type of concern <span className="text-[#d93025]">*</span>
            </label>
            <select
              id="safeguarding-concern-type"
              value={formData.concernType}
              onChange={(e) => handleChange('concernType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] ${
                errors.concernType ? 'border-[#d93025]' : 'border-[#dadce0] dark:border-gray-600'
              }`}
              aria-required="true"
              aria-invalid={Boolean(errors.concernType)}
              aria-describedby={errors.concernType ? 'concern-type-error' : undefined}
            >
              {CONCERN_TYPES.map((opt) => (
                <option key={opt.value || 'empty'} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.concernType && (
              <p id="concern-type-error" className="mt-1 text-xs text-[#d93025] dark:text-red-400">
                {errors.concernType}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="safeguarding-description" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Description <span className="text-[#d93025]">*</span>
            </label>
            <textarea
              id="safeguarding-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={4}
              placeholder="Describe what happened, when, and who was involved. Include as much detail as you can."
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 placeholder-[#5f6368] dark:placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] ${
                errors.description ? 'border-[#d93025]' : 'border-[#dadce0] dark:border-gray-600'
              }`}
              aria-required="true"
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
            />
            {errors.description && (
              <p id="description-error" className="mt-1 text-xs text-[#d93025] dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {children.length > 0 && (
            <div>
              <label htmlFor="safeguarding-child" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
                Related to (optional)
              </label>
              <select
                id="safeguarding-child"
                value={formData.childId ?? ''}
                onChange={(e) => handleChange('childId', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8]"
              >
                <option value="">Not specific to a child</option>
                {children.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="safeguarding-date" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Date of concern (optional)
            </label>
            <input
              id="safeguarding-date"
              type="date"
              value={formData.dateOfConcern ?? ''}
              onChange={(e) => handleChange('dateOfConcern', e.target.value)}
              className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8]"
            />
          </div>

          <div>
            <label htmlFor="safeguarding-contact" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              How should we contact you? (optional)
            </label>
            <input
              id="safeguarding-contact"
              type="text"
              value={formData.contactPreference ?? ''}
              onChange={(e) => handleChange('contactPreference', e.target.value)}
              placeholder="e.g. phone, email, or leave blank to use your account details"
              className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 placeholder-[#5f6368] dark:placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8]"
            />
          </div>

          {errors.submit && (
            <p className="text-sm text-[#d93025] dark:text-red-400" role="alert">
              {errors.submit}
            </p>
          )}
      </form>
    </BaseModal>
  );
}
