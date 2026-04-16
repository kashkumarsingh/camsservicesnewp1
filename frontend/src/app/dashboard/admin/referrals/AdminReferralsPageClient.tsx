'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ROUTES } from '@/shared/utils/routes';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';

interface ReferralRow {
  id: string;
  referrerName: string;
  referrerEmail: string;
  youngPersonName: string | null;
  primaryConcern: string | null;
  preferredPackage: string | null;
  status: string;
  createdAt: string | null;
}

interface ListResponse {
  data: ReferralRow[];
  meta: { total_count: number; limit: number; offset: number };
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function AdminReferralsPageClient() {
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ListResponse>(`${API_ENDPOINTS.ADMIN_REFERRALS}?limit=50`);
      setRows(response.data?.data ?? []);
      setTotalCount(response.data?.meta?.total_count ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load referrals');
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Referrals' },
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
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">Referral submissions</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Dedicated referral intake feed, separated from general contact enquiries.
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
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          No referrals found yet.
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Referrer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Young person</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Concern</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Submitted</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {rows.map((row) => (
                  <tr key={row.id} className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">{row.referrerName}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{row.referrerEmail}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{row.youngPersonName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{row.primaryConcern ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">{formatDate(row.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link className="text-sm font-semibold text-cams-primary hover:text-cams-secondary" href={`${ROUTES.DASHBOARD_ADMIN_REFERRALS}/${row.id}`}>
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-400">
            {totalCount} referral{totalCount === 1 ? '' : 's'} total
          </div>
        </div>
      )}
    </section>
  );
}

