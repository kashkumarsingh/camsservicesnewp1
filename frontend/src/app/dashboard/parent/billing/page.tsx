import type { Metadata } from 'next';
import React from 'react';
import { Breadcrumbs } from '@/components/dashboard/universal';
import ParentBillingPageClient from './ParentBillingPageClient';
import { ROUTES } from '@/shared/utils/routes';

export const metadata: Metadata = {
  title: 'Parent Dashboard - Billing & invoices',
  description: 'View your payment history and download receipts.',
};

export default function ParentBillingPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Breadcrumbs
          items={[
            { label: 'Parent', href: ROUTES.DASHBOARD_PARENT },
            { label: 'Billing & invoices' },
          ]}
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Billing & invoices
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            View payment history and download receipts for your bookings and top-ups.
          </p>
        </div>
      </header>

      <ParentBillingPageClient />
    </section>
  );
}
