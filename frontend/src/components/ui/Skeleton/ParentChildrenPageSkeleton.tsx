/**
 * Parent Children Page Skeleton
 *
 * Matches ParentChildrenPageClient layout: breadcrumbs, header (title + Add child),
 * then grid of child cards. Renders inside DashboardShell.
 */

import React from 'react';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';

function ChildCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="mb-4 h-12 w-full bg-slate-100 dark:bg-slate-700/50 rounded-md" />
      <div className="flex flex-wrap gap-2">
        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export default function ParentChildrenPageSkeleton() {
  const count = SKELETON_COUNTS.DASHBOARD_CHILDREN;
  return (
    <section className="space-y-4 px-2 sm:px-4 animate-pulse" aria-busy="true" aria-label="Loading children">
      <header className="space-y-2">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="h-6 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
          <div className="h-9 w-28 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <ChildCardSkeleton key={`parent-children-skeleton-${i}`} />
        ))}
      </div>
    </section>
  );
}
