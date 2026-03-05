'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useMyBookings } from '@/interfaces/web/hooks/booking/useMyBookings';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import type { PaymentDTO } from '@/core/application/payment/dto/PaymentDTO';
import { EmptyState } from '@/components/dashboard/universal';
import { TableRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDateTime } from '@/utils/formatDate';
import { ROUTES } from '@/utils/routes';
import {
  VIEW_RECEIPT_LABEL,
  PAYMENT_TYPE_LABEL_PACKAGE,
  PAYMENT_TYPE_LABEL_TOP_UP,
} from '@/utils/appConstants';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { ExternalLink } from 'lucide-react';
import { getPaymentStatusBadgeClasses } from '@/utils/statusBadgeHelpers';

type FlatPayment = {
  bookingReference: string;
  bookingId: string;
  payment: PaymentDTO;
};

/** Only successful (completed) payments for invoices list — no timeline of pending/processing. */
function flattenCompletedPayments(bookings: BookingDTO[]): FlatPayment[] {
  const out: FlatPayment[] = [];
  for (const b of bookings) {
    const ref = b.reference ?? '';
    const id = String(b.id ?? '');
    const payments = b.payments ?? [];
    for (const p of payments) {
      if (p.status === 'completed') {
        out.push({ bookingReference: ref, bookingId: id, payment: p });
      }
    }
  }
  return out.sort((a, b) => {
    const da = a.payment.processedAt ?? a.payment.createdAt ?? '';
    const db = b.payment.processedAt ?? b.payment.createdAt ?? '';
    return db.localeCompare(da);
  });
}

function getTypeLabel(payment: PaymentDTO): string {
  return payment.paymentType === 'top_up' ? PAYMENT_TYPE_LABEL_TOP_UP : PAYMENT_TYPE_LABEL_PACKAGE;
}

export default function ParentBillingPageClient() {
  const { bookings, loading, error } = useMyBookings();

  const flatPayments = useMemo(() => flattenCompletedPayments(bookings), [bookings]);
  const hasPayments = flatPayments.length > 0;

  if (loading) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
            <thead className="text-2xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th scope="col" className="px-4 py-3">Booking</th>
                <th scope="col" className="px-4 py-3">Description</th>
                <th scope="col" className="px-4 py-3">Amount</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Date</th>
                <th scope="col" className="px-4 py-3 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={6} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400">{error}</p>
      </div>
    );
  }

  if (!hasPayments) {
    return (
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
        <EmptyState
          title={EMPTY_STATE.NO_INVOICES_YET.title}
          message={EMPTY_STATE.NO_INVOICES_YET.message}
          action={
            <Link
              href={ROUTES.DASHBOARD_PARENT_BOOKINGS}
              className="text-sm font-medium text-primary-blue hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded"
            >
              View bookings
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-700 dark:text-slate-200">
          <thead className="text-2xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th scope="col" className="px-4 py-3">
                Booking
              </th>
              <th scope="col" className="px-4 py-3">
                Description
              </th>
              <th scope="col" className="px-4 py-3">
                Amount
              </th>
              <th scope="col" className="px-4 py-3">
                Status
              </th>
              <th scope="col" className="px-4 py-3">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Invoice
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {flatPayments.map(({ bookingReference, bookingId, payment }) => (
              <tr
                key={payment.id}
                className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3">
                  <Link
                    href={ROUTES.BOOKING_BY_REFERENCE(bookingReference)}
                    className="font-medium text-primary-blue hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded"
                  >
                    {bookingReference}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {getTypeLabel(payment)}
                </td>
                <td className="px-4 py-3 font-medium">
                  {formatCurrency(payment.amount)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-medium border ${getPaymentStatusBadgeClasses(payment.status)}`}
                  >
                    {payment.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                  {payment.processedAt
                    ? formatDateTime(payment.processedAt)
                    : payment.createdAt
                      ? formatDateTime(payment.createdAt)
                      : '—'}
                </td>
                <td className="px-4 py-3 text-right">
                  {payment.receiptUrl ? (
                    <a
                      href={payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-primary-blue hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded"
                    >
                      {VIEW_RECEIPT_LABEL}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    </a>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 text-2xs">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
