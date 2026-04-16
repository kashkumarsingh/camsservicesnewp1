'use client';

import React from 'react';
import { Breadcrumbs } from '@/components/dashboard/universal';
import DashboardButton from '@/design-system/components/Button/DashboardButton';
import Link from 'next/link';
import { ROUTES } from '@/shared/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/shared/utils/appConstants';
import {
  PUBLIC_PAGES_CONTENT_SLUGS,
  PUBLIC_PAGES_CONTENT_LABELS,
  POLICY_DOCUMENT_SLUGS,
  POLICY_DOCUMENT_LABELS,
  type PublicPageContentSlug,
  type PolicyDocumentSlug,
} from '@/dashboard/utils/publicPageConstants';
import { FileText, ExternalLink } from 'lucide-react';

/**
 * Public Pages Content Management — fixed list of pages; admin edits text only (no blocks, no create).
 */
export const AdminPublicPagesPageClient: React.FC = () => {
  return (
    <section className="space-y-4">
      <header className="space-y-3">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Public Pages Content' },
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
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Public Pages Content Management
          </h1>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Edit text content for each public page. No block builder — change headings, copy, and
            CTAs only.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(PUBLIC_PAGES_CONTENT_SLUGS as readonly string[]).map((slug) => {
          const label = PUBLIC_PAGES_CONTENT_LABELS[slug as PublicPageContentSlug] ?? slug;
          const publicPath =
            slug === 'policies'
              ? ROUTES.POLICIES
              : slug === 'blog'
                ? ROUTES.BLOG
                : slug === 'packages'
                  ? ROUTES.PACKAGES
                  : slug === 'services'
                    ? ROUTES.SERVICES
                    : slug === 'contact'
                      ? ROUTES.CONTACT
                      : slug === 'faq'
                        ? ROUTES.FAQ
                        : slug === 'trainers'
                          ? ROUTES.TRAINERS
                          : slug === 'about'
                            ? ROUTES.ABOUT
                            : ROUTES.PAGE_BY_SLUG(slug);
          return (
            <div
              key={slug}
              className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                <span className="font-medium text-slate-900 dark:text-slate-50">{label}</span>
              </div>
              <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">/{slug}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <DashboardButton
                  href={ROUTES.DASHBOARD_ADMIN_PUBLIC_PAGE_CONTENT_EDIT(slug)}
                  variant="primary"
                  size="sm"
                >
                  Edit content
                </DashboardButton>
                <DashboardButton
                  href={publicPath}
                  variant="bordered"
                  size="sm"
                  icon={<ExternalLink className="h-3 w-3" />}
                  aria-label={`View ${label} on public site`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </DashboardButton>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-slate-200 pt-8 dark:border-slate-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">
          Policy documents
        </h2>
        <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">
          Individual policy pages under /policies. Edit title, summary, and full content.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {POLICY_DOCUMENT_SLUGS.map((slug) => {
            const label = POLICY_DOCUMENT_LABELS[slug as PolicyDocumentSlug] ?? slug;
            return (
              <div
                key={slug}
                className="flex flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/50"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 flex-shrink-0 text-slate-500 dark:text-slate-400" />
                  <span className="font-medium text-slate-900 dark:text-slate-50">{label}</span>
                </div>
                <p className="mt-1 text-2xs text-slate-500 dark:text-slate-400">/policies/{slug}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <DashboardButton
                    href={ROUTES.DASHBOARD_ADMIN_PUBLIC_PAGE_CONTENT_EDIT(slug)}
                    variant="primary"
                    size="sm"
                  >
                    Edit content
                  </DashboardButton>
                  <DashboardButton
                    href={ROUTES.POLICIES_BY_SLUG(slug)}
                    variant="bordered"
                    size="sm"
                    icon={<ExternalLink className="h-3 w-3" />}
                    aria-label={`View ${label} on public site`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </DashboardButton>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
