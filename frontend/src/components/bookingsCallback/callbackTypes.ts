import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

export type CallbackStatus = 'loading' | 'success' | 'canceled' | 'error';

export interface CallbackSuccessCardProps {
  message: string;
  bookingReference: string | null;
  bookingId: string | null;
  hasSessions: boolean;
  onCopyReference: (reference: string) => void;
  dashboardHref: string;
  packagesHref: string;
}

export interface CallbackCanceledCardProps {
  loadingBooking: boolean;
  booking: BookingDTO | null;
  paymentHref: string;
  dashboardHref: string;
}

export interface CallbackErrorCardProps {
  message: string;
  dashboardHref: string;
  packagesHref: string;
}
