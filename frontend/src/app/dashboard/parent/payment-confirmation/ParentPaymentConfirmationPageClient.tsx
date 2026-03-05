'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Loader2, ArrowLeft, Receipt } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ApiPaymentService, type ConfirmFromSessionBooking, type ConfirmFromSessionPayment } from '@/infrastructure/services/payment/ApiPaymentService';
import { ROUTES } from '@/utils/routes';
import {
  INVOICE_PAID_TITLE,
  POWERED_BY_STRIPE,
  VIEW_RECEIPT_LABEL,
  PAYMENT_TYPE_LABEL_PACKAGE,
  PAYMENT_TYPE_LABEL_TOP_UP,
  CURRENCY_CODE,
  INVOICE_FROM_NAME,
} from '@/utils/appConstants';
import { Breadcrumbs } from '@/components/dashboard/universal';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-GB', { style: 'currency', currency: CURRENCY_CODE }).format(amount);
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ParentPaymentConfirmationPageClient() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'no_session'>('idle');
  const [booking, setBooking] = useState<ConfirmFromSessionBooking | null>(null);
  const [payment, setPayment] = useState<ConfirmFromSessionPayment | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const runConfirm = useCallback(async () => {
    if (!sessionId) {
      setStatus('no_session');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    const result = await ApiPaymentService.confirmPaymentFromSession(sessionId);
    if (result.ok) {
      setBooking(result.booking);
      setPayment(result.payment);
      setStatus('success');
    } else {
      setErrorMessage(result.error);
      setStatus('error');
    }
  }, [sessionId]);

  useEffect(() => {
    if (status !== 'idle') return;
    runConfirm();
  }, [status, runConfirm]);

  if (status === 'no_session') {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Breadcrumbs
          items={[{ label: 'Parent', href: ROUTES.DASHBOARD_PARENT }, { label: 'Payment confirmation' }]}
        />
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center">
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            No payment session found. If you just completed a payment, try opening the link from your email or return to the dashboard.
          </p>
          <Link href={ROUTES.DASHBOARD_PARENT}>
            <Button variant="primary">Back to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Breadcrumbs
          items={[{ label: 'Parent', href: ROUTES.DASHBOARD_PARENT }, { label: 'Payment confirmation' }]}
        />
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-12 text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary-blue" aria-hidden />
          <p className="mt-4 text-slate-600 dark:text-slate-400">Confirming your payment…</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="max-w-xl mx-auto space-y-4">
        <Breadcrumbs
          items={[{ label: 'Parent', href: ROUTES.DASHBOARD_PARENT }, { label: 'Payment confirmation' }]}
        />
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-8 text-center">
          <p className="text-slate-700 dark:text-slate-300 mb-2">We couldn’t confirm this payment.</p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">{errorMessage}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button variant="primary" onClick={runConfirm}>Try again</Button>
            <Link href={ROUTES.DASHBOARD_PARENT}>
              <Button variant="bordered">Back to dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status !== 'success' || !booking || !payment) {
    return null;
  }

  const lineItemLabel =
    payment.paymentType === 'top_up' ? PAYMENT_TYPE_LABEL_TOP_UP : PAYMENT_TYPE_LABEL_PACKAGE;
  const remaining =
    Number(booking.totalPrice) - Number(booking.paidAmount) - Number(booking.discountAmount ?? 0);

  return (
    <div className="max-w-2xl mx-auto space-y-6 print:max-w-none">
      <Breadcrumbs
        items={[{ label: 'Parent', href: ROUTES.DASHBOARD_PARENT }, { label: 'Payment confirmation' }]}
      />

      {/* Success header */}
      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 p-6 flex flex-col sm:flex-row items-center gap-4">
        <CheckCircle className="h-12 w-12 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden />
        <div className="text-center sm:text-left">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{INVOICE_PAID_TITLE}</h1>
          <p className="mt-1 text-lg font-medium text-slate-800 dark:text-slate-200">
            {formatCurrency(payment.amount)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Booking {booking.reference} · {formatDate(payment.processedAt)}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Actions</h2>
        <div className="flex flex-wrap gap-3">
          {payment.receiptUrl && (
            <a
              href={payment.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-primary-blue bg-primary-blue/5 px-4 py-2 text-sm font-medium text-primary-blue hover:bg-primary-blue/10 focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2"
            >
              <Receipt className="h-4 w-4" aria-hidden />
              {VIEW_RECEIPT_LABEL}
            </a>
          )}
          <Link href={ROUTES.DASHBOARD_PARENT}>
            <Button variant="bordered" className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              Back to dashboard
            </Button>
          </Link>
        </div>
      </div>

      {/* Invoice summary */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 print:shadow-none">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Invoice summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
          <div>
            <p className="font-medium text-slate-500 dark:text-slate-400 mb-1">To</p>
            <p className="text-slate-900 dark:text-slate-100">
              {[booking.parentFirstName, booking.parentLastName].filter(Boolean).join(' ') || '—'}
            </p>
            {booking.parentEmail && (
              <p className="text-slate-600 dark:text-slate-400">{booking.parentEmail}</p>
            )}
          </div>
          <div>
            <p className="font-medium text-slate-500 dark:text-slate-400 mb-1">From</p>
            <p className="text-slate-900 dark:text-slate-100">{INVOICE_FROM_NAME}</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Invoice / reference: <span className="font-medium text-slate-900 dark:text-slate-100">{booking.reference}</span>
        </p>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-600">
              <th className="text-left py-2 font-medium text-slate-600 dark:text-slate-400">Description</th>
              <th className="text-right py-2 font-medium text-slate-600 dark:text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              <td className="py-2 text-slate-900 dark:text-slate-100">
                {lineItemLabel} – {booking.packageName ?? 'Package'}
              </td>
              <td className="py-2 text-right text-slate-900 dark:text-slate-100">
                {formatCurrency(payment.amount)}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Total</span>
            <span>{formatCurrency(Number(booking.totalPrice))}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Amount paid</span>
            <span>{formatCurrency(Number(booking.paidAmount))}</span>
          </div>
          <div className="flex justify-between font-medium text-slate-900 dark:text-slate-100">
            <span>Amount remaining</span>
            <span>{formatCurrency(Math.max(0, remaining))}</span>
          </div>
        </div>
      </div>

      {/* Powered by Stripe */}
      <p className="text-center text-xs text-slate-500 dark:text-slate-400">
        <a
          href="https://stripe.com"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-slate-700 dark:hover:text-slate-300 underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded"
        >
          {POWERED_BY_STRIPE}
        </a>
      </p>
    </div>
  );
}
