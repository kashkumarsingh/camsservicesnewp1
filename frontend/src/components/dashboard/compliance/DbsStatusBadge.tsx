'use client';

import {
  dbsStatusBadgeClass,
  formatDbsStatusLabel,
  type DbsStatus,
} from '@/dashboard/utils/dbsComplianceUtils';

interface DbsStatusBadgeProps {
  status: DbsStatus | string;
  expiresAt?: string | null;
  className?: string;
}

export function DbsStatusBadge({ status, expiresAt, className = '' }: DbsStatusBadgeProps) {
  const label = formatDbsStatusLabel(status);
  const expiryHint =
    expiresAt && status !== 'missing' && status !== 'unknown'
      ? ` (${new Date(expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })})`
      : '';

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${dbsStatusBadgeClass(status)} ${className}`}
    >
      {label}
      {expiryHint}
    </span>
  );
}
