'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ROUTES } from '@/shared/utils/routes';

interface ReferralDetail {
  id: string;
  status: string;
  createdAt: string | null;
  referrerName: string;
  referrerRole: string | null;
  referrerEmail: string;
  referrerPhone: string | null;
  youngPersonName: string | null;
  youngPersonAge: string | null;
  schoolSetting: string | null;
  primaryConcern: string | null;
  backgroundContext: string | null;
  successOutcome: string | null;
  preferredPackage: string | null;
  additionalInfo: string | null;
}

export function AdminReferralDetailPageClient({ id }: { id: string }) {
  const [referral, setReferral] = useState<ReferralDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<ReferralDetail>(API_ENDPOINTS.ADMIN_REFERRAL_BY_ID(id));
      setReferral(response.data ?? null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load referral');
      setReferral(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.DASHBOARD_ADMIN_REFERRALS} className="text-sm font-semibold text-cams-primary hover:text-cams-secondary">
          Back to referrals
        </Link>
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="space-y-4">
        <Link href={ROUTES.DASHBOARD_ADMIN_REFERRALS} className="text-sm font-semibold text-cams-primary hover:text-cams-secondary">
          Back to referrals
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
          Referral not found.
        </div>
      </div>
    );
  }

  const rows: Array<[string, string]> = [
    ['Referrer name', referral.referrerName],
    ['Referrer role', referral.referrerRole ?? '—'],
    ['Referrer email', referral.referrerEmail],
    ['Referrer phone', referral.referrerPhone ?? '—'],
    ['Young person', referral.youngPersonName ?? '—'],
    ['Young person age', referral.youngPersonAge ?? '—'],
    ['School/setting', referral.schoolSetting ?? '—'],
    ['Primary concern', referral.primaryConcern ?? '—'],
    ['Preferred package', referral.preferredPackage ?? '—'],
    ['Background context', referral.backgroundContext ?? '—'],
    ['Success outcome', referral.successOutcome ?? '—'],
    ['Additional info', referral.additionalInfo ?? '—'],
  ];

  return (
    <section className="space-y-4">
      <Link href={ROUTES.DASHBOARD_ADMIN_REFERRALS} className="text-sm font-semibold text-cams-primary hover:text-cams-secondary">
        Back to referrals
      </Link>
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <header className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Referral #{referral.id}</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{referral.createdAt ?? '—'}</p>
        </header>
        <dl className="divide-y divide-slate-200 dark:divide-slate-800">
          {rows.map(([label, value]) => (
            <div key={label} className="grid grid-cols-1 gap-2 px-5 py-3 md:grid-cols-[220px_1fr]">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</dt>
              <dd className="text-sm text-slate-800 dark:text-slate-100">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

