'use client';

import type { ReactElement } from 'react';
import Link from 'next/link';
import {
  MEMBERSHIP_STAYS_COPY,
  PORTAL_ACCOUNT_ACTIONS,
} from '@/marketing/content/membership-subscriptions';
import { ROUTES } from '@/shared/utils/routes';

type MembershipAccountPanelProps = {
  membershipStatus: 'ACTIVE' | 'ENDED';
  supportSubscriptionStatus: 'ACTIVE' | 'PAUSED' | 'NONE';
  availableSupportHours: number;
  hoursExpireOn?: string | null;
  subscriptionName?: string | null;
  nextBillingDate?: string | null;
};

export function MembershipAccountPanel({
  membershipStatus,
  supportSubscriptionStatus,
  availableSupportHours,
  hoursExpireOn,
  subscriptionName,
  nextBillingDate,
}: MembershipAccountPanelProps): ReactElement {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">CAMS account</p>
      <h2 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
        Membership and Support Subscription
      </h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{MEMBERSHIP_STAYS_COPY}</p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Membership status</dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">{membershipStatus}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Support Subscription status
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {supportSubscriptionStatus}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Available support hours</dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {availableSupportHours.toFixed(1)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours remaining</dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {availableSupportHours.toFixed(1)}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Hours expire on</dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {hoursExpireOn ?? 'End of current subscription period'}
          </dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">Next billing date</dt>
          <dd className="mt-1 text-base font-semibold text-slate-900 dark:text-slate-50">
            {nextBillingDate ?? 'Shown when a Support Subscription is active'}
          </dd>
        </div>
      </dl>

      {subscriptionName ? (
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Current package: {subscriptionName}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {PORTAL_ACCOUNT_ACTIONS.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="inline-flex rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-primary-blue hover:text-primary-blue dark:border-slate-600 dark:text-slate-200"
          >
            {action.label}
          </Link>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        Ending CAMS Membership is separate from pausing a Support Subscription.{' '}
        <Link href={ROUTES.PACKAGES} className="font-semibold text-primary-blue hover:underline">
          View membership plans
        </Link>
      </p>
    </section>
  );
}
