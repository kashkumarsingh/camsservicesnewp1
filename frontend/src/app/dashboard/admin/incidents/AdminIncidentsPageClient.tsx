'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Loader2, ShieldAlert } from 'lucide-react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ROUTES } from '@/shared/utils/routes';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import {
  INCIDENT_STATUSES,
  INCIDENT_STATUS_LABELS,
  INCIDENT_TYPES,
  INCIDENT_TYPE_LABELS,
  formatIncidentSeverity,
  formatIncidentStatus,
  formatIncidentType,
  type IncidentStatus,
} from '@/dashboard/utils/incidentConstants';

interface IncidentRow {
  id: number;
  reference: string;
  incidentType: string;
  severity: string;
  description: string;
  location?: string | null;
  occurredAt?: string | null;
  childName?: string | null;
  status: string;
  immediateActions?: string | null;
  followUpNotes?: string | null;
  reportedByName?: string | null;
  reportedByEmail?: string | null;
  dslReviewedAt?: string | null;
  reviewedByName?: string | null;
  createdAt: string;
  updatedAt?: string;
}

interface ListResponse {
  data: { incidents: IncidentRow[] };
  meta?: { total_count: number };
}

interface DetailResponse {
  data: { incident: IncidentRow };
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : d.toLocaleString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
}

function severityBadgeClass(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
    case 'reviewing':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
  }
}

export function AdminIncidentsPageClient() {
  const [rows, setRows] = useState<IncidentRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<IncidentRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editStatus, setEditStatus] = useState<IncidentStatus>('open');
  const [editFollowUp, setEditFollowUp] = useState('');
  const [editImmediateActions, setEditImmediateActions] = useState('');
  const [markDslReviewed, setMarkDslReviewed] = useState(false);

  const fetchIncidents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ limit: '50' });
      if (statusFilter) params.set('status', statusFilter);
      if (typeFilter) params.set('type', typeFilter);
      const response = await apiClient.get<ListResponse>(
        `${API_ENDPOINTS.ADMIN_INCIDENTS}?${params.toString()}`
      );
      const payload = response.data as ListResponse['data'] & { meta?: { total_count?: number } };
      const nested = (response.data as { data?: { incidents?: IncidentRow[] }; meta?: { total_count?: number } })?.data;
      setRows(nested?.incidents ?? payload?.incidents ?? []);
      setTotalCount(
        (response.data as { meta?: { total_count?: number } })?.meta?.total_count ??
          nested?.incidents?.length ??
          0
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  const loadDetail = useCallback(async (id: number) => {
    setDetailLoading(true);
    setSelectedId(id);
    try {
      const response = await apiClient.get<DetailResponse>(API_ENDPOINTS.ADMIN_INCIDENT_BY_ID(id));
      const incident = response.data?.incident;
      if (incident) {
        setDetail(incident);
        setEditStatus((incident.status as IncidentStatus) || 'open');
        setEditFollowUp(incident.followUpNotes ?? '');
        setEditImmediateActions(incident.immediateActions ?? '');
        setMarkDslReviewed(false);
      }
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    setError(null);
    try {
      await apiClient.patch(API_ENDPOINTS.ADMIN_INCIDENT_BY_ID(selectedId), {
        status: editStatus,
        followUpNotes: editFollowUp,
        immediateActions: editImmediateActions,
        dslReviewed: markDslReviewed,
      });
      await fetchIncidents();
      await loadDetail(selectedId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update incident');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = useMemo(
    () => rows.filter((r) => r.status === 'open' || r.status === 'reviewing').length,
    [rows]
  );

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Incident reports' },
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
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" aria-hidden />
              Incident reports
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Triage and review incidents reported by trainers and staff. Parent safeguarding concerns remain in Reports.
            </p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
              <ShieldAlert size={14} aria-hidden />
              {pendingCount} pending
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {INCIDENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {INCIDENT_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {INCIDENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {INCIDENT_TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
            </div>
          ) : rows.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              No incident reports found.
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Ref</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Severity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Reporter</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Submitted</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {rows.map((row) => (
                      <tr
                        key={row.id}
                        onClick={() => loadDetail(row.id)}
                        className={`cursor-pointer bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                          selectedId === row.id ? 'ring-2 ring-inset ring-cams-primary' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{row.reference}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatIncidentType(row.incidentType)}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${severityBadgeClass(row.severity)}`}>
                            {formatIncidentSeverity(row.severity)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{row.reportedByName ?? '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}>
                            {formatIncidentStatus(row.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDateTime(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-slate-200 px-4 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Showing {rows.length} of {totalCount} reports
              </p>
            </div>
          )}
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 min-h-[320px]">
            {!selectedId ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
                Select an incident to review details and update status.
              </p>
            ) : detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" aria-hidden />
              </div>
            ) : detail ? (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{detail.reference}</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {formatIncidentType(detail.incidentType)} · {formatIncidentSeverity(detail.severity)}
                  </p>
                </div>

                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Reported by</dt>
                    <dd className="text-slate-600 dark:text-slate-400">
                      {detail.reportedByName ?? '—'}
                      {detail.reportedByEmail ? ` (${detail.reportedByEmail})` : ''}
                    </dd>
                  </div>
                  {detail.childName && (
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Child</dt>
                      <dd className="text-slate-600 dark:text-slate-400">{detail.childName}</dd>
                    </div>
                  )}
                  {detail.location && (
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">Location</dt>
                      <dd className="text-slate-600 dark:text-slate-400">{detail.location}</dd>
                    </div>
                  )}
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Occurred</dt>
                    <dd className="text-slate-600 dark:text-slate-400">{formatDateTime(detail.occurredAt)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700 dark:text-slate-300">Submitted</dt>
                    <dd className="text-slate-600 dark:text-slate-400">{formatDateTime(detail.createdAt)}</dd>
                  </div>
                  {detail.dslReviewedAt && (
                    <div>
                      <dt className="font-medium text-slate-700 dark:text-slate-300">DSL reviewed</dt>
                      <dd className="text-slate-600 dark:text-slate-400">
                        {formatDateTime(detail.dslReviewedAt)}
                        {detail.reviewedByName ? ` by ${detail.reviewedByName}` : ''}
                      </dd>
                    </div>
                  )}
                </dl>

                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap">{detail.description}</p>
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-700 space-y-3">
                  <div>
                    <label htmlFor="incident-edit-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Status
                    </label>
                    <select
                      id="incident-edit-status"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as IncidentStatus)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                      {INCIDENT_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {INCIDENT_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="incident-edit-immediate" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Immediate actions
                    </label>
                    <textarea
                      id="incident-edit-immediate"
                      value={editImmediateActions}
                      onChange={(e) => setEditImmediateActions(e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  <div>
                    <label htmlFor="incident-edit-followup" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Follow-up notes
                    </label>
                    <textarea
                      id="incident-edit-followup"
                      value={editFollowUp}
                      onChange={(e) => setEditFollowUp(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800"
                    />
                  </div>

                  {!detail.dslReviewedAt && (
                    <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <input
                        type="checkbox"
                        checked={markDslReviewed}
                        onChange={(e) => setMarkDslReviewed(e.target.checked)}
                        className="rounded border-slate-300"
                      />
                      Mark as DSL reviewed
                    </label>
                  )}

                  <DashboardButton
                    type="button"
                    variant="primary"
                    size="sm"
                    disabled={saving}
                    onClick={handleSave}
                    icon={saving ? <Loader2 size={16} className="animate-spin" /> : undefined}
                  >
                    {saving ? 'Saving…' : 'Save changes'}
                  </DashboardButton>
                </div>
              </div>
            ) : (
              <p className="text-sm text-rose-600 dark:text-rose-400">Could not load incident details.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
