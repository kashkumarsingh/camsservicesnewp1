'use client';

import React, { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import BaseModal from '@/components/ui/Modal/BaseModal';
import {
  INCIDENT_SEVERITIES,
  INCIDENT_SEVERITY_LABELS,
  INCIDENT_TYPES,
  INCIDENT_TYPE_LABELS,
} from '@/dashboard/utils/incidentConstants';

export interface IncidentReportFormData {
  incidentType: string;
  severity: string;
  description: string;
  location?: string;
  occurredAt?: string;
  childId?: number;
  bookingScheduleId?: number;
  immediateActions?: string;
}

export interface IncidentChildOption {
  id: number;
  name: string;
}

interface IncidentReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  childrenOptions?: IncidentChildOption[];
  onSubmit: (data: IncidentReportFormData) => Promise<void>;
}

export default function IncidentReportModal({
  isOpen,
  onClose,
  childrenOptions = [],
  onSubmit,
}: IncidentReportModalProps) {
  const [formData, setFormData] = useState<IncidentReportFormData>({
    incidentType: '',
    severity: 'medium',
    description: '',
    location: '',
    occurredAt: '',
    childId: undefined,
    immediateActions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    field: keyof IncidentReportFormData,
    value: string | number | undefined
  ) => {
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
    if (!formData.incidentType.trim()) {
      next.incidentType = 'Please select an incident type.';
    }
    if (!formData.severity.trim()) {
      next.severity = 'Please select a severity level.';
    }
    if (!formData.description.trim()) {
      next.description = 'Please describe the incident.';
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
      const payload: IncidentReportFormData = {
        incidentType: formData.incidentType,
        severity: formData.severity,
        description: formData.description.trim(),
        location: formData.location?.trim() || undefined,
        occurredAt: formData.occurredAt?.trim() || undefined,
        childId: formData.childId || undefined,
        immediateActions: formData.immediateActions?.trim() || undefined,
      };
      await onSubmit(payload);
      setFormData({
        incidentType: '',
        severity: 'medium',
        description: '',
        location: '',
        occurredAt: '',
        childId: undefined,
        immediateActions: '',
      });
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Incident report submit error:', err);
      setErrors({ submit: 'Something went wrong. Please try again or contact management directly.' });
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
          <AlertTriangle size={20} className="text-amber-500 dark:text-amber-400" aria-hidden />
          Report an incident
        </span>
      }
      size="md"
      footer={
        <div className="flex flex-col-reverse sm:flex-row gap-2 w-full justify-end">
          <DashboardButton type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </DashboardButton>
          <DashboardButton
            type="submit"
            form="incident-report-form"
            variant="primary"
            size="sm"
            disabled={isSubmitting}
            icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
          >
            {isSubmitting ? 'Submitting…' : 'Submit report'}
          </DashboardButton>
        </div>
      }
    >
      <form id="incident-report-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-[#5f6368] dark:text-gray-400">
          Use this form for accidents, transport issues, near misses, and other operational incidents.
          For urgent safeguarding concerns you can also select safeguarding as the type.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="incident-type" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Incident type <span className="text-[#d93025]">*</span>
            </label>
            <select
              id="incident-type"
              value={formData.incidentType}
              onChange={(e) => handleChange('incidentType', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] ${
                errors.incidentType ? 'border-[#d93025]' : 'border-[#dadce0] dark:border-gray-600'
              }`}
              aria-required="true"
            >
              <option value="">Select type…</option>
              {INCIDENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {INCIDENT_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
            {errors.incidentType && (
              <p className="mt-1 text-xs text-[#d93025] dark:text-red-400">{errors.incidentType}</p>
            )}
          </div>

          <div>
            <label htmlFor="incident-severity" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Severity <span className="text-[#d93025]">*</span>
            </label>
            <select
              id="incident-severity"
              value={formData.severity}
              onChange={(e) => handleChange('severity', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] ${
                errors.severity ? 'border-[#d93025]' : 'border-[#dadce0] dark:border-gray-600'
              }`}
              aria-required="true"
            >
              {INCIDENT_SEVERITIES.map((level) => (
                <option key={level} value={level}>
                  {INCIDENT_SEVERITY_LABELS[level]}
                </option>
              ))}
            </select>
            {errors.severity && (
              <p className="mt-1 text-xs text-[#d93025] dark:text-red-400">{errors.severity}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="incident-description" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
            Description <span className="text-[#d93025]">*</span>
          </label>
          <textarea
            id="incident-description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={4}
            placeholder="What happened, when, who was involved, and any witnesses."
            className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100 placeholder-[#5f6368] dark:placeholder-gray-400 focus:ring-2 focus:ring-[#1a73e8] focus:border-[#1a73e8] ${
              errors.description ? 'border-[#d93025]' : 'border-[#dadce0] dark:border-gray-600'
            }`}
            aria-required="true"
          />
          {errors.description && (
            <p className="mt-1 text-xs text-[#d93025] dark:text-red-400">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="incident-location" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Location (optional)
            </label>
            <input
              id="incident-location"
              type="text"
              value={formData.location ?? ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="e.g. school gate, vehicle, session venue"
              className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100"
            />
          </div>

          <div>
            <label htmlFor="incident-occurred-at" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Date and time (optional)
            </label>
            <input
              id="incident-occurred-at"
              type="datetime-local"
              value={formData.occurredAt ?? ''}
              onChange={(e) => handleChange('occurredAt', e.target.value)}
              className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100"
            />
          </div>
        </div>

        {childrenOptions.length > 0 && (
          <div>
            <label htmlFor="incident-child" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
              Related child (optional)
            </label>
            <select
              id="incident-child"
              value={formData.childId ?? ''}
              onChange={(e) =>
                handleChange('childId', e.target.value ? parseInt(e.target.value, 10) : undefined)
              }
              className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100"
            >
              <option value="">Not specific to a child</option>
              {childrenOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="incident-immediate-actions" className="block text-sm font-medium text-[#202124] dark:text-gray-100 mb-1">
            Immediate actions taken (optional)
          </label>
          <textarea
            id="incident-immediate-actions"
            value={formData.immediateActions ?? ''}
            onChange={(e) => handleChange('immediateActions', e.target.value)}
            rows={2}
            placeholder="e.g. first aid given, parent contacted, area secured"
            className="w-full px-3 py-2 border border-[#dadce0] dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-[#202124] dark:text-gray-100"
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
