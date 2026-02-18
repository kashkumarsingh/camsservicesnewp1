'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

interface TrainerApplicationFull {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  addressLineOne?: string | null;
  addressLineTwo?: string | null;
  city?: string | null;
  county?: string | null;
  travelRadiusKm: number;
  serviceAreaPostcodes: string[];
  availabilityPreferences: string[];
  excludedActivityIds: number[];
  exclusionReason?: string | null;
  preferredAgeGroups: string[];
  experienceYears: number;
  bio?: string | null;
  certifications: string[];
  hasDbsCheck: boolean;
  dbsIssuedAt?: string | null;
  dbsExpiresAt?: string | null;
  insuranceProvider?: string | null;
  insuranceExpiresAt?: string | null;
  desiredHourlyRate?: number | null;
  attachments: string[];
  status: string;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'submitted':
    case 'under_review':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'approved':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'rejected':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h2>
      <div className="space-y-2 text-sm text-slate-800 dark:text-slate-200">{children}</div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-2">
      <span className="font-medium text-slate-600 dark:text-slate-400 sm:w-40 shrink-0">{label}</span>
      <span className="text-slate-900 dark:text-slate-100">{value}</span>
    </div>
  );
}

export function AdminTrainerApplicationDetailPageClient({ id }: { id: string }) {
  const router = useRouter();
  const [application, setApplication] = useState<TrainerApplicationFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [acting, setActing] = useState(false);

  const fetchApplication = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<{ data: TrainerApplicationFull } | { data: { data: TrainerApplicationFull } }>(API_ENDPOINTS.ADMIN_TRAINER_APPLICATION_BY_ID(id));
      const inner = (res as { data: TrainerApplicationFull | { data: TrainerApplicationFull } }).data;
      setApplication('data' in inner && inner.data ? inner.data : (inner as TrainerApplicationFull));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
      setApplication(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleApprove = useCallback(async () => {
    setActing(true);
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_APPLICATION_APPROVE(id), { notes: '', createUserAccount: true });
      await fetchApplication();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
    } finally {
      setActing(false);
    }
  }, [id, fetchApplication]);

  const handleReject = useCallback(async () => {
    const reason = window.prompt('Rejection reason (optional):');
    if (reason === null) return;
    setActing(true);
    try {
      await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_APPLICATION_REJECT(id), { reason: reason || undefined });
      await fetchApplication();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
    } finally {
      setActing(false);
    }
  }, [id, fetchApplication]);

  if (loading) {
    return (
      <section className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 animate-spin text-slate-400" aria-hidden />
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Loading application…</p>
      </section>
    );
  }

  if (error || !application) {
    return (
      <section className="space-y-4">
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/trainer-applications')}
          className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
        >
          ← Back to applications
        </button>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error ?? 'Application not found.'}
        </div>
      </section>
    );
  }

  const isPending = application.status === 'submitted' || application.status === 'under_review';

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/trainer-applications')}
            className="mb-2 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            ← Back to applications
          </button>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Trainer application: {application.reference}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Submitted {formatDate(application.createdAt ?? null)}
          </p>
        </div>
        <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getStatusBadge(application.status)}`}>
          {application.status}
        </span>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <DetailSection title="Contact">
          <DetailRow label="Name" value={application.fullName} />
          <DetailRow label="Email" value={application.email} />
          <DetailRow label="Phone" value={application.phone} />
        </DetailSection>

        <DetailSection title="Address">
          <DetailRow label="Address" value={[application.addressLineOne, application.addressLineTwo].filter(Boolean).join(', ')} />
          <DetailRow label="City" value={application.city} />
          <DetailRow label="County" value={application.county} />
          <DetailRow label="Postcode" value={application.postcode} />
        </DetailSection>

        <DetailSection title="Coverage">
          <DetailRow label="Travel radius" value={`${application.travelRadiusKm} km`} />
          <DetailRow
            label="Availability"
            value={
              application.availabilityPreferences?.length
                ? application.availabilityPreferences.join(', ')
                : '—'
            }
          />
          <DetailRow
            label="Service area postcodes"
            value={
              application.serviceAreaPostcodes?.length
                ? application.serviceAreaPostcodes.join(', ')
                : '—'
            }
          />
        </DetailSection>

        <DetailSection title="Experience">
          <DetailRow label="Years experience" value={`${application.experienceYears} years`} />
          <DetailRow
            label="Preferred age groups"
            value={
              application.preferredAgeGroups?.length
                ? application.preferredAgeGroups.join(', ')
                : '—'
            }
          />
          <DetailRow label="Bio" value={application.bio} />
          <DetailRow
            label="Certifications"
            value={
              application.certifications?.length
                ? application.certifications.join(', ')
                : '—'
            }
          />
        </DetailSection>

        <DetailSection title="Activity exclusions">
          <DetailRow
            label="Excluded activity IDs"
            value={
              application.excludedActivityIds?.length
                ? application.excludedActivityIds.join(', ')
                : 'None'
            }
          />
          <DetailRow label="Exclusion reason" value={application.exclusionReason} />
        </DetailSection>

        <DetailSection title="Safeguarding">
          <DetailRow label="DBS check" value={application.hasDbsCheck ? 'Yes' : 'No'} />
          <DetailRow label="DBS issued" value={application.dbsIssuedAt ? formatDate(application.dbsIssuedAt) : null} />
          <DetailRow label="DBS expires" value={application.dbsExpiresAt ? formatDate(application.dbsExpiresAt) : null} />
          <DetailRow label="Insurance provider" value={application.insuranceProvider} />
          <DetailRow label="Insurance expires" value={application.insuranceExpiresAt ? formatDate(application.insuranceExpiresAt) : null} />
        </DetailSection>

        <DetailSection title="Compensation">
          <DetailRow
            label="Desired hourly rate"
            value={application.desiredHourlyRate != null ? `£${Number(application.desiredHourlyRate).toFixed(2)}` : '—'}
          />
        </DetailSection>

        {(application.attachments?.length ?? 0) > 0 && (
          <DetailSection title="Attachments">
            <ul className="list-inside list-disc text-slate-700 dark:text-slate-300">
              {application.attachments.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </DetailSection>
        )}

        {(application.reviewedAt || application.reviewNotes) && (
          <DetailSection title="Review">
            <DetailRow label="Reviewed at" value={application.reviewedAt ? formatDate(application.reviewedAt) : null} />
            <DetailRow label="Notes" value={application.reviewNotes} />
          </DetailSection>
        )}
      </div>

      {isPending && (
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6 dark:border-slate-700">
          <button
            type="button"
            onClick={handleApprove}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
          >
            {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Approve
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={acting}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-800 hover:bg-rose-100 disabled:opacity-50 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200"
          >
            {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
            Reject
          </button>
        </div>
      )}
    </section>
  );
}
