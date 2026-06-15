'use client';

import React from 'react';
import type { CreateStaffDTO, UpdateStaffDTO } from '@/core/application/admin/dto/AdminStaffDTO';
import {
  STAFF_EMPLOYMENT_STATUS_OPTIONS,
  STAFF_VISA_STATUS_OPTIONS,
} from '@/core/application/admin/dto/AdminStaffDTO';

type StaffFormData = CreateStaffDTO | UpdateStaffDTO;

interface StaffFormProps {
  formData: StaffFormData;
  onChange: (data: StaffFormData) => void;
  isCreating?: boolean;
}

const inputClass =
  'h-9 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50';

const labelClass = 'mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400';

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label className={labelClass}>
        {label}
        {required ? ' *' : ''}
      </label>
      {children}
    </div>
  );
}

export const StaffForm: React.FC<StaffFormProps> = ({ formData, onChange, isCreating }) => {
  const update = (patch: Partial<StaffFormData>) => onChange({ ...formData, ...patch });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Personal details
        </h3>
        <Field label="Full name" required>
          <input
            type="text"
            required
            value={formData.name ?? ''}
            onChange={(e) => update({ name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Email">
            <input
              type="email"
              value={formData.email ?? ''}
              onChange={(e) => update({ email: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Phone">
            <input
              type="tel"
              placeholder="07xxx xxxxxx"
              value={formData.phone ?? ''}
              onChange={(e) => update({ phone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <Field label="Address line 1">
          <input
            type="text"
            value={formData.addressLineOne ?? ''}
            onChange={(e) => update({ addressLineOne: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Address line 2">
          <input
            type="text"
            value={formData.addressLineTwo ?? ''}
            onChange={(e) => update({ addressLineTwo: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Field label="City">
            <input
              type="text"
              value={formData.city ?? ''}
              onChange={(e) => update({ city: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="County">
            <input
              type="text"
              value={formData.county ?? ''}
              onChange={(e) => update({ county: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Postcode">
            <input
              type="text"
              placeholder="SW1A 1AA"
              value={formData.postcode ?? ''}
              onChange={(e) => update({ postcode: e.target.value.toUpperCase() })}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Employment
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Job title" required>
            <input
              type="text"
              required
              placeholder="e.g. Programme Manager, Director"
              value={formData.jobTitle ?? ''}
              onChange={(e) => update({ jobTitle: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Department">
            <input
              type="text"
              placeholder="e.g. Operations, Safeguarding"
              value={formData.department ?? ''}
              onChange={(e) => update({ department: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Start date">
            <input
              type="date"
              value={formData.startDate ?? ''}
              onChange={(e) => update({ startDate: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Employment status">
            <select
              value={formData.employmentStatus ?? 'active'}
              onChange={(e) =>
                update({ employmentStatus: e.target.value as CreateStaffDTO['employmentStatus'] })
              }
              className={inputClass}
            >
              {STAFF_EMPLOYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Right to work &amp; citizenship
        </h3>
        <Field label="Citizenship / nationality">
          <input
            type="text"
            placeholder="e.g. British, Polish"
            value={formData.citizenship ?? ''}
            onChange={(e) => update({ citizenship: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Visa / immigration status" required>
          <select
            value={formData.visaStatus ?? 'british_citizen'}
            onChange={(e) =>
              update({ visaStatus: e.target.value as CreateStaffDTO['visaStatus'] })
            }
            className={inputClass}
          >
            {STAFF_VISA_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(formData.rightToWorkVerified)}
            onChange={(e) => update({ rightToWorkVerified: e.target.checked })}
            className="rounded border-slate-300"
          />
          Right to work verified
        </label>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Verified on">
            <input
              type="date"
              value={formData.rightToWorkVerifiedAt ?? ''}
              onChange={(e) => update({ rightToWorkVerifiedAt: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Visa / permission expires">
            <input
              type="date"
              value={formData.rightToWorkExpiresAt ?? ''}
              onChange={(e) => update({ rightToWorkExpiresAt: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          DBS &amp; safeguarding
        </h3>
        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
          <input
            type="checkbox"
            checked={Boolean(formData.hasDbsCheck)}
            onChange={(e) => update({ hasDbsCheck: e.target.checked })}
            className="rounded border-slate-300"
          />
          Enhanced DBS check on file
        </label>
        <Field label="DBS certificate number">
          <input
            type="text"
            value={formData.dbsCertificateNumber ?? ''}
            onChange={(e) => update({ dbsCertificateNumber: e.target.value })}
            className={inputClass}
          />
        </Field>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="DBS issued">
            <input
              type="date"
              value={formData.dbsIssuedAt ?? ''}
              onChange={(e) => update({ dbsIssuedAt: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="DBS expires">
            <input
              type="date"
              value={formData.dbsExpiresAt ?? ''}
              onChange={(e) => update({ dbsExpiresAt: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Emergency contact
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Contact name">
            <input
              type="text"
              value={formData.emergencyContactName ?? ''}
              onChange={(e) => update({ emergencyContactName: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Contact phone">
            <input
              type="tel"
              value={formData.emergencyContactPhone ?? ''}
              onChange={(e) => update({ emergencyContactPhone: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>
      </section>

      <section className="space-y-3">
        <Field label="Admin notes">
          <textarea
            rows={3}
            value={formData.notes ?? ''}
            onChange={(e) => update({ notes: e.target.value })}
            className={`${inputClass} h-auto py-2`}
            placeholder="Onboarding notes, document references, etc."
          />
        </Field>
        {isCreating && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Onboarding date and recorded-by will be set automatically when you save.
          </p>
        )}
      </section>
    </div>
  );
};
