export const DBS_EXPIRY_WARNING_DAYS = 30;

export const DBS_STATUSES = [
  'valid',
  'expiring_soon',
  'expired',
  'missing',
  'unknown',
] as const;

export type DbsStatus = (typeof DBS_STATUSES)[number];

export const DBS_STATUS_LABELS: Record<DbsStatus, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring soon',
  expired: 'Expired',
  missing: 'DBS not recorded',
  unknown: 'Expiry date missing',
};

export const DBS_PROCEDURE_TEMPLATE_SLUG = 'dbs-checking-management';

export function getDbsStatus(
  expiresAt: string | null | undefined,
  hasDbsCheck = true
): DbsStatus {
  if (!hasDbsCheck && !expiresAt) {
    return 'missing';
  }
  if (!expiresAt) {
    return hasDbsCheck ? 'unknown' : 'missing';
  }
  const expiry = new Date(expiresAt);
  if (Number.isNaN(expiry.getTime())) {
    return 'unknown';
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= DBS_EXPIRY_WARNING_DAYS) return 'expiring_soon';
  return 'valid';
}

export function dbsStatusNeedsAttention(status: DbsStatus | string | null | undefined): boolean {
  return status === 'expired' || status === 'expiring_soon' || status === 'missing';
}

export function dbsStatusBadgeClass(status: DbsStatus | string): string {
  switch (status) {
    case 'expired':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200';
    case 'expiring_soon':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
    case 'missing':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
    case 'unknown':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
    default:
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
  }
}

export function formatDbsStatusLabel(status: DbsStatus | string): string {
  return DBS_STATUS_LABELS[status as DbsStatus] ?? status;
}
