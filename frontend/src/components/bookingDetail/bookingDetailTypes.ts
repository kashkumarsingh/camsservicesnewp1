import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import type { LucideIcon } from 'lucide-react';

export interface BookingDetailHeaderProps {
  reference: string;
  backHref: string;
}

export interface BookingDetailMainCardProps {
  booking: BookingDTO;
  statusLabel: string;
  paymentLabel: string;
  statusBadgeClassName: string;
  paymentBadgeClassName: string;
  outstandingAmount: number;
  needsPaymentRefresh: boolean;
  refreshing: boolean;
  refreshError: string | null;
  onRefreshPayment: () => void;
  payOutstandingHref: string;
  payOutstandingLabel: string;
  backToDashboardHref: string;
  formatCurrency: (n: number) => string;
  formatDate: (d: string) => string;
}

export interface BookingDetailStateCardProps {
  title: string;
  message: string;
  variant: 'loading' | 'error' | 'notFound';
  onGoBack?: () => void;
  goBackLabel: string;
  goToDashboardHref: string;
  goToDashboardLabel: string;
}
