'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { EmptyState } from '@/components/dashboard/universal/EmptyState';
import { RowActions, ApproveAction, RejectAction } from '@/components/dashboard/universal/RowActions';
import Link from 'next/link';
import { ROUTES } from '@/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/utils/appConstants';
import { Loader2 } from 'lucide-react';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface TrainerApplicationRow {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  postcode: string;
  status: string;
  experienceYears: number;
  hasDbsCheck: boolean;
  createdAt: string | null;
  reviewedAt: string | null;
}

interface ListResponse {
  data: TrainerApplicationRow[];
  meta: { total_count: number; limit: number; offset: number };
}

function formatDate(iso: string | null): string {
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

export function AdminTrainerApplicationsPageClient() {
  const router = useRouter();
  const [applications, setApplications] = useState<TrainerApplicationRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const fetchList = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      params.set('limit', '50');
      const url = params.toString()
        ? `${API_ENDPOINTS.ADMIN_TRAINER_APPLICATIONS}?${params}`
        : API_ENDPOINTS.ADMIN_TRAINER_APPLICATIONS;
      const res = await apiClient.get<ListResponse>(url);
      setApplications(res.data?.data ?? []);
      setTotalCount(res.data?.meta?.total_count ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load trainer applications');
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleApprove = useCallback(
    async (id: string) => {
      setActingId(id);
      try {
        await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_APPLICATION_APPROVE(id), {
          notes: '',
          createUserAccount: true,
        });
        await fetchList();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to approve');
      } finally {
        setActingId(null);
      }
    },
    [fetchList]
  );

  const handleReject = useCallback(
    async (id: string) => {
      const reason = window.prompt('Rejection reason (optional):');
      if (reason === null) return; // cancelled
      setActingId(id);
      try {
        await apiClient.post(API_ENDPOINTS.ADMIN_TRAINER_APPLICATION_REJECT(id), { reason: reason || undefined });
        await fetchList();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to reject');
      } finally {
        setActingId(null);
      }
    },
    [fetchList]
  );

  const pending = applications.filter((a) => a.status === 'submitted' || a.status === 'under_review');

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Trainer applications' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Trainer applications
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Review and approve or reject new trainer applications. Approved applications create a trainer profile and can receive a login email.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          title={EMPTY_STATE.NO_TRAINER_APPLICATIONS_FOUND.title}
          message={EMPTY_STATE.NO_TRAINER_APPLICATIONS_FOUND.message}
          action={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="mt-3 inline-block text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Reference
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Applicant
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Experience
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    DBS
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Submitted
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => router.push(`/dashboard/admin/trainer-applications/${app.id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        router.push(`/dashboard/admin/trainer-applications/${app.id}`);
                      }
                    }}
                    className="cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 text-sm font-mono text-slate-900 dark:text-slate-100">
                      {app.reference}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                      {app.fullName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {app.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {app.experienceYears} years
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {app.hasDbsCheck ? 'Yes' : 'No'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {formatDate(app.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadge(app.status)}`}>
                        {app.status}
                      </span>
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      {(app.status === 'submitted' || app.status === 'under_review') && (
                        <RowActions>
                          <ApproveAction
                            onClick={() => handleApprove(app.id)}
                            disabled={actingId !== null}
                            aria-label="Approve"
                          />
                          <RejectAction
                            onClick={() => handleReject(app.id)}
                            disabled={actingId !== null}
                            aria-label="Reject"
                          />
                        </RowActions>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {totalCount} application{totalCount !== 1 ? 's' : ''} total
            {pending.length > 0 && ` · ${pending.length} awaiting review`}
          </div>
        </div>
      )}
    </section>
  );
}
