'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ExternalLink,
  Mail,
  AlertTriangle,
  PoundSterling,
  Baby,
} from 'lucide-react';
import { useAdminDashboardStats } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { useAdminUsers } from '@/interfaces/web/hooks/dashboard/useAdminUsers';
import { useAdminChildren } from '@/interfaces/web/hooks/dashboard/useAdminChildren';
import type { AdminUserDTO } from '@/core/application/admin/dto/AdminUserDTO';
import type { AdminChildDTO } from '@/core/application/admin/dto/AdminChildDTO';
import type { ChildWithZeroHoursItem, PendingPaymentItem } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { ListRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type FamiliesFilter = 'all' | 'low_hours' | 'payment_issues';

interface FamilyWithChildren {
  parent: AdminUserDTO;
  children: AdminChildDTO[];
  hasZeroHoursChild: boolean;
  hasPaymentIssue: boolean;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function buildFamilies(
  parents: AdminUserDTO[],
  children: AdminChildDTO[],
  zeroHoursList: ChildWithZeroHoursItem[],
  pendingPaymentsList: PendingPaymentItem[],
): FamilyWithChildren[] {
  const zeroHoursChildIds = new Set(zeroHoursList.map((x) => x.childId));
  const paymentIssueParentNames = new Set(
    pendingPaymentsList.map((x) => x.parentName?.trim().toLowerCase()).filter(Boolean),
  );
  const childrenByParentId = new Map<string, AdminChildDTO[]>();
  for (const c of children) {
    const pid = c.parentId ?? '__none__';
    if (!childrenByParentId.has(pid)) childrenByParentId.set(pid, []);
    childrenByParentId.get(pid)!.push(c);
  }

  return parents
    .filter((p) => p.approvalStatus === 'approved')
    .map((parent) => {
      const childList = childrenByParentId.get(parent.id) ?? [];
      const hasZeroHoursChild = childList.some((c) => zeroHoursChildIds.has(c.id));
      const hasPaymentIssue = paymentIssueParentNames.has(parent.name?.trim().toLowerCase() ?? '');
      return {
        parent,
        children: childList,
        hasZeroHoursChild,
        hasPaymentIssue,
      };
    });
}

function filterFamilies(
  families: FamilyWithChildren[],
  filter: FamiliesFilter,
): FamilyWithChildren[] {
  if (filter === 'all') return families;
  if (filter === 'low_hours') return families.filter((f) => f.hasZeroHoursChild);
  if (filter === 'payment_issues') return families.filter((f) => f.hasPaymentIssue);
  return families;
}

// -----------------------------------------------------------------------------
// Family card
// -----------------------------------------------------------------------------

function FamilyCard({
  family,
  zeroHoursChildIds,
  onViewParent,
  onViewChildren,
}: {
  family: FamilyWithChildren;
  zeroHoursChildIds: Set<string>;
  onViewParent: () => void;
  onViewChildren: () => void;
}) {
  const { parent, children, hasZeroHoursChild, hasPaymentIssue } = family;
  const hasAlert = hasZeroHoursChild || hasPaymentIssue;

  return (
    <article
      className={`rounded-xl border p-4 shadow-sm ${
        hasAlert
          ? 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/50'
      }`}
      aria-labelledby={`family-${parent.id}`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 id={`family-${parent.id}`} className="font-semibold text-slate-900 dark:text-slate-100">
            {parent.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">{parent.email}</p>
          {children.length > 0 && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {children.length} child{children.length !== 1 ? 'ren' : ''}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {parent.email && (
            <a
              href={`mailto:${parent.email}`}
              className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <Mail className="h-3.5 w-3.5" aria-hidden />
              Contact
            </a>
          )}
          <button
            type="button"
            onClick={onViewParent}
            className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
          >
            View profile
          </button>
          <button
            type="button"
            onClick={onViewChildren}
            className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
          >
            Add hours
          </button>
        </div>
      </div>

      {hasPaymentIssue && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-amber-100 px-2.5 py-1.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
          <PoundSterling className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Pending payment
        </div>
      )}

      {children.length > 0 && (
        <ul className="mt-3 space-y-1.5 border-t border-slate-200 pt-3 dark:border-slate-700">
          {children.map((child) => {
            const isZeroHours = zeroHoursChildIds.has(child.id);
            return (
              <li
                key={child.id}
                className="flex items-center justify-between gap-2 text-sm"
              >
                <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                  <Baby className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
                  {child.name}
                </span>
                {isZeroHours && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
                    <AlertTriangle className="h-3 w-3" aria-hidden />
                    0 hours
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {children.length === 0 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">No children registered</p>
      )}
    </article>
  );
}

// -----------------------------------------------------------------------------
// Main tab
// -----------------------------------------------------------------------------

export function AdminDashboardFamiliesTab() {
  const router = useRouter();
  const { stats, loading: statsLoading } = useAdminDashboardStats();
  const { users: parentUsers, loading: parentsLoading } = useAdminUsers({ role: 'parent' });
  const { children, loading: childrenLoading } = useAdminChildren({});
  const [filter, setFilter] = useState<FamiliesFilter>('all');

  const parents = useMemo(
    () => parentUsers.filter((u) => u.role === 'parent'),
    [parentUsers],
  );

  const zeroHoursList = stats?.alerts?.childrenWithZeroHoursList ?? [];
  const pendingPaymentsList = stats?.alerts?.pendingPaymentsList ?? [];
  const zeroHoursChildIds = useMemo(
    () => new Set(zeroHoursList.map((x) => x.childId)),
    [zeroHoursList],
  );

  const families = useMemo(
    () => buildFamilies(parents, children, zeroHoursList, pendingPaymentsList),
    [parents, children, zeroHoursList, pendingPaymentsList],
  );

  const filteredFamilies = useMemo(
    () => filterFamilies(families, filter),
    [families, filter],
  );

  const isLoading = statsLoading || parentsLoading || childrenLoading;
  const activeCount = stats?.users?.parentsApproved ?? 0;
  const zeroHoursCount = stats?.alerts?.childrenWithZeroHoursCount ?? 0;
  const pendingPaymentsCount = stats?.alerts?.pendingPaymentsCount ?? 0;
  const newCount = stats?.users?.parentsPendingApproval ?? 0;

  const handleViewParent = () => {
    router.push('/dashboard/admin/parents');
  };

  const handleViewChildren = () => {
    router.push('/dashboard/admin/bookings');
  };

  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900" aria-busy="true" aria-label="Loading families">
        <div className="mx-auto max-w-md">
          <ListRowsSkeleton count={SKELETON_COUNTS.LIST_ROWS} />
        </div>
      </section>
    );
  }

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="families-tab-heading"
    >
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 id="families-tab-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Families
        </h2>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
          <span><strong className="text-slate-700 dark:text-slate-200">{activeCount}</strong> active</span>
          {zeroHoursCount > 0 && (
            <span className="font-medium text-rose-600 dark:text-rose-400">
              {zeroHoursCount} with 0 hours
            </span>
          )}
          {pendingPaymentsCount > 0 && (
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {pendingPaymentsCount} pending payments
            </span>
          )}
          {newCount > 0 && (
            <span><strong className="text-slate-700 dark:text-slate-200">{newCount}</strong> new (pending approval)</span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Filter:</span>
          {(
            [
              { id: 'all' as const, label: 'All' },
              { id: 'low_hours' as const, label: 'Low hours' },
              { id: 'payment_issues' as const, label: 'Payment issues' },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === id
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-800 dark:border-indigo-400 dark:bg-indigo-950/50 dark:text-indigo-200'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
          <Link
            href="/dashboard/admin/parents"
            className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View parents
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/dashboard/admin/children"
            className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View children
            <ExternalLink className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </header>

      <div className="p-6">
        {filteredFamilies.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filter === 'all'
              ? 'No active families to show.'
              : `No families match the "${filter === 'low_hours' ? 'Low hours' : 'Payment issues'}" filter.`}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredFamilies.map((family) => (
              <FamilyCard
                key={family.parent.id}
                family={family}
                zeroHoursChildIds={zeroHoursChildIds}
                onViewParent={handleViewParent}
                onViewChildren={handleViewChildren}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
