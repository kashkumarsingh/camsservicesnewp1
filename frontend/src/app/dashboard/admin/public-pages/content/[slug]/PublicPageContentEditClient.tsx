'use client';

import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { ROUTES } from '@/shared/utils/routes';
import {
  PUBLIC_PAGES_CONTENT_LABELS,
  PUBLIC_PAGES_CONTENT_EDIT_UNAVAILABLE,
  POLICY_DOCUMENT_SLUGS,
  POLICY_DOCUMENT_LABELS,
  type PublicPageContentSlug,
  type PolicyDocumentSlug,
} from '@/dashboard/utils/publicPageConstants';

function isPolicyDocumentSlug(s: string): s is PolicyDocumentSlug {
  return (POLICY_DOCUMENT_SLUGS as readonly string[]).includes(s);
}

interface PublicPageContentEditClientProps {
  slug: string;
}

export function PublicPageContentEditClient({ slug }: PublicPageContentEditClientProps) {
  const isPolicyDoc = isPolicyDocumentSlug(slug);
  const label = isPolicyDoc
    ? (POLICY_DOCUMENT_LABELS[slug] ?? slug)
    : (PUBLIC_PAGES_CONTENT_LABELS[slug as PublicPageContentSlug] ?? slug);

  return (
    <section className="space-y-4">
      <header className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Public Pages Content', href: ROUTES.DASHBOARD_ADMIN_PUBLIC_PAGES },
            { label },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN_PUBLIC_PAGES}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              Back to list
            </Link>
          }
        />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Edit “{label}” page
        </h1>
      </header>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900/50">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {PUBLIC_PAGES_CONTENT_EDIT_UNAVAILABLE}
        </p>
        <Link
          href={ROUTES.DASHBOARD_ADMIN_PUBLIC_PAGES}
          className="mt-3 inline-block text-sm font-medium text-primary-blue hover:underline"
        >
          Back to Public Pages Content
        </Link>
      </div>
    </section>
  );
}
