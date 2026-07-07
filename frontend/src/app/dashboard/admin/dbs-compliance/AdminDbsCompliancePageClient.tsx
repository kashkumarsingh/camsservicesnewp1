'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileText, Loader2, ShieldCheck } from 'lucide-react';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { DbsStatusBadge } from '@/components/dashboard/compliance/DbsStatusBadge';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import {
  DBS_EXPIRY_WARNING_DAYS,
  DBS_PROCEDURE_TEMPLATE_SLUG,
  dbsStatusNeedsAttention,
} from '@/dashboard/utils/dbsComplianceUtils';
import { adminOperationalDocumentRepository } from '@/infrastructure/http/admin/AdminOperationalDocumentRepository';

interface DbsComplianceRecord {
  kind: 'staff' | 'trainer';
  id: string;
  name: string;
  roleLabel?: string;
  hasDbsCheck: boolean;
  dbsExpiresAt?: string | null;
  dbsStatus: string;
  daysUntilExpiry?: number | null;
  trainerApplicationId?: string | null;
}

interface DbsComplianceResponse {
  records: DbsComplianceRecord[];
  attentionCount: number;
  warningDays: number;
}

function recordHref(record: DbsComplianceRecord): string {
  if (record.kind === 'staff') {
    return `${ROUTES.DASHBOARD_ADMIN_STAFF}?dbs=attention`;
  }
  if (record.trainerApplicationId) {
    return `${ROUTES.DASHBOARD_ADMIN_TRAINER_APPLICATIONS}/${record.trainerApplicationId}`;
  }
  return `${ROUTES.DASHBOARD_ADMIN_TRAINERS}?id=${record.id}`;
}

export function AdminDbsCompliancePageClient() {
  const [records, setRecords] = useState<DbsComplianceRecord[]>([]);
  const [warningDays, setWarningDays] = useState(DBS_EXPIRY_WARNING_DAYS);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [templateDownloading, setTemplateDownloading] = useState(false);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const qs = showAll ? '?all=1' : '';
      const response = await apiClient.get<DbsComplianceResponse>(
        `${API_ENDPOINTS.ADMIN_DBS_COMPLIANCE}${qs}`
      );
      setRecords(response.data?.records ?? []);
      setWarningDays(response.data?.warningDays ?? DBS_EXPIRY_WARNING_DAYS);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load DBS compliance data');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [showAll]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const attentionCount = useMemo(
    () => records.filter((r) => dbsStatusNeedsAttention(r.dbsStatus)).length,
    [records]
  );

  const handleDownloadProcedure = async () => {
    setTemplateDownloading(true);
    setError(null);
    try {
      const docs = await adminOperationalDocumentRepository.list('safeguarding');
      const template =
        docs.find((d) => d.slug === DBS_PROCEDURE_TEMPLATE_SLUG) ??
        (await adminOperationalDocumentRepository.list()).find(
          (d) => d.slug === DBS_PROCEDURE_TEMPLATE_SLUG
        );
      if (!template) {
        setError('DBS procedure document not found. Run operational-documents:seed or upload via Compliance docs.');
        return;
      }
      await adminOperationalDocumentRepository.download(template.id, template.file_name);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to download DBS procedure');
    } finally {
      setTemplateDownloading(false);
    }
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'DBS compliance' },
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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-cams-primary" aria-hidden />
          DBS compliance
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Staff DBS expiry dates and trainer DBS from approved applications. Alerts appear when checks expire within{' '}
          {warningDays} days or are overdue.
        </p>
      </header>

      <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/50 dark:bg-blue-950/20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" aria-hidden />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Follow the DBS Checking and Management Procedure for renewals and record-keeping.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadProcedure}
            disabled={templateDownloading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            {templateDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Download className="h-4 w-4" aria-hidden />
            )}
            DBS procedure
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="rounded border-slate-300"
          />
          Show all active staff and trainers
        </label>
        {!showAll && attentionCount > 0 && (
          <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
            {attentionCount} need attention
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          {showAll
            ? 'No active staff or trainers found.'
            : 'No DBS expiry issues in the next 30 days. All recorded checks look current.'}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">DBS status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {records.map((record) => (
                  <tr key={`${record.kind}-${record.id}`} className="bg-white dark:bg-slate-900">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{record.name}</td>
                    <td className="px-4 py-3 text-sm capitalize text-slate-600 dark:text-slate-400">{record.kind}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{record.roleLabel ?? '—'}</td>
                    <td className="px-4 py-3">
                      <DbsStatusBadge status={record.dbsStatus} expiresAt={record.dbsExpiresAt} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={recordHref(record)}
                        className="text-sm font-semibold text-cams-primary hover:text-cams-secondary"
                      >
                        Open record
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}
