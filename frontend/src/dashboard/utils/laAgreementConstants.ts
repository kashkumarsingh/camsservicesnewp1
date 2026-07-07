export const LA_AGREEMENT_STATUSES = ['draft', 'active', 'expired'] as const;

export type LaAgreementStatus = (typeof LA_AGREEMENT_STATUSES)[number];

export const LA_AGREEMENT_STATUS_LABELS: Record<LaAgreementStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  expired: 'Expired',
};

export function formatLaAgreementStatus(status: string): string {
  return LA_AGREEMENT_STATUS_LABELS[status as LaAgreementStatus] ?? status;
}

export function laAgreementStatusBadgeClass(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
    case 'expired':
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
  }
}

/** Slug of the template in operational documents (Compliance docs). */
export const LA_AGREEMENT_TEMPLATE_SLUG = 'local-authority-data-sharing-agreement';
