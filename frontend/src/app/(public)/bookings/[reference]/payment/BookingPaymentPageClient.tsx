'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/formatDate';
import type { PaymentMethod } from '@/infrastructure/services/payment/types';
import { AlertCircle, CheckCircle, CreditCard, ArrowLeft, Package, Lock } from 'lucide-react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button';
import PaymentForm from '@/components/booking/payment/PaymentForm';
import { ROUTES } from '@/utils/routes';
import {
  BookingPaymentStateCard,
  BOOKING_PAYMENT_LOADING,
  BOOKING_PAYMENT_ERROR,
  BOOKING_PAYMENT_NOT_FOUND,
  BOOKING_PAYMENT_HEADER,
  BOOKING_PAYMENT_SUMMARY,
  BOOKING_PAYMENT_CANCELLED,
  BOOKING_PAYMENT_COMPLETE,
  BOOKING_PAYMENT_FORM,
  BOOKING_PAYMENT_ACTIONS,
} from '@/components/bookingPayment';

interface BookingPaymentPageClientProps {
  reference: string;
}

const BookingPaymentPageClient: React.FC<BookingPaymentPageClientProps> = ({ reference }) => {
  const router = useRouter();
  const { booking, loading, error, refetch } = useBooking(undefined, reference);
  const [paymentStatus, setPaymentStatus] = useState<
    'pending' | 'processing' | 'completed' | 'failed'
  >('pending');

  const handlePaymentComplete = useCallback(
    async (_method: PaymentMethod, _transactionId: string) => {
      setPaymentStatus('processing');
      await refetch();
      setPaymentStatus('completed');
    },
    [refetch]
  );

  const handlePaymentFailed = useCallback((_method: PaymentMethod, _errorMessage: string) => {
    setPaymentStatus('failed');
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <BookingPaymentStateCard
            title=""
            message={BOOKING_PAYMENT_LOADING.message}
            variant="loading"
            goBackLabel={BOOKING_PAYMENT_ERROR.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_PAYMENT_ERROR.goToDashboard}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <BookingPaymentStateCard
            title={BOOKING_PAYMENT_ERROR.title}
            message={error}
            variant="error"
            onGoBack={() => router.back()}
            goBackLabel={BOOKING_PAYMENT_ERROR.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_PAYMENT_ERROR.goToDashboard}
          />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <BookingPaymentStateCard
            title={BOOKING_PAYMENT_NOT_FOUND.title}
            message={BOOKING_PAYMENT_NOT_FOUND.description}
            variant="notFound"
            onGoBack={() => router.back()}
            goBackLabel={BOOKING_PAYMENT_NOT_FOUND.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_PAYMENT_NOT_FOUND.goToDashboard}
          />
        </div>
      </div>
    );
  }

  const calculatedOutstanding = (booking.totalPrice ?? 0) - (booking.paidAmount ?? 0);
  const outstandingAmount =
    booking.outstandingAmount !== undefined
      ? booking.outstandingAmount
      : Math.max(0, calculatedOutstanding);
  const isFullyPaid =
    booking.paymentStatus === 'paid' ||
    (outstandingAmount <= 0 && (booking.paidAmount ?? 0) >= (booking.totalPrice ?? 0));
  const isCancelled = booking.status === 'cancelled' || booking.status === 'canceled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link
            href={ROUTES.BOOKING_BY_REFERENCE(booking.reference)}
            className="inline-flex items-center gap-2 text-primary-blue hover:text-primary-blue/90 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{BOOKING_PAYMENT_HEADER.backToBooking}</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-navy-blue mb-2">
            {isFullyPaid ? BOOKING_PAYMENT_HEADER.titleStatus : BOOKING_PAYMENT_HEADER.titleComplete}
          </h1>
          <p className="text-gray-600">
            {BOOKING_PAYMENT_HEADER.referenceLabel}{' '}
            <span className="font-mono font-semibold">{booking.reference}</span>
          </p>
          {isFullyPaid && (
            <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
              <CheckCircle size={16} />
              <span className="font-medium">{BOOKING_PAYMENT_HEADER.fullyPaid}</span>
            </p>
          )}
        </div>

        <Card className="p-6 shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-primary-blue" size={24} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-navy-blue">
                {booking.package?.name ?? BOOKING_PAYMENT_SUMMARY.packageFallback}
              </h2>
              <p className="text-sm text-gray-600">
                {BOOKING_PAYMENT_SUMMARY.created} {formatDate(booking.createdAt)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">{BOOKING_PAYMENT_SUMMARY.totalPrice}</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{BOOKING_PAYMENT_SUMMARY.paid}</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(booking.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">{BOOKING_PAYMENT_SUMMARY.outstanding}</p>
              <p
                className={`text-lg font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}
              >
                {formatCurrency(outstandingAmount)}
              </p>
            </div>
          </div>
        </Card>

        {isCancelled && (
          <Card className="p-6 bg-red-50 border-red-200 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">
                  {BOOKING_PAYMENT_CANCELLED.title}
                </h3>
                <p className="text-sm text-red-800">{BOOKING_PAYMENT_CANCELLED.description}</p>
              </div>
            </div>
          </Card>
        )}

        {isFullyPaid && !isCancelled && (
          <Card className="p-6 bg-green-50 border-green-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">
                  {BOOKING_PAYMENT_COMPLETE.title}
                </h3>
                <p className="text-sm text-green-800">{BOOKING_PAYMENT_COMPLETE.description}</p>
                {booking.paymentStatus === 'paid' && (
                  <p className="text-xs text-green-700 mt-1">
                    {BOOKING_PAYMENT_COMPLETE.paymentStatusLabel}{' '}
                    <span className="font-semibold">{BOOKING_PAYMENT_COMPLETE.paid}</span> •{' '}
                    {BOOKING_PAYMENT_COMPLETE.amountPaid}{' '}
                    <span className="font-semibold">
                      {formatCurrency(booking.paidAmount ?? 0)}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={ROUTES.BOOKING_BY_REFERENCE(booking.reference)} className="flex-1">
                <Button variant="outline" className="w-full">
                  {BOOKING_PAYMENT_COMPLETE.viewBookingDetails}
                </Button>
              </Link>
              <Link href={ROUTES.DASHBOARD_PARENT} className="flex-1">
                <Button className="w-full">{BOOKING_PAYMENT_COMPLETE.goToDashboard}</Button>
              </Link>
            </div>
          </Card>
        )}

        {!isFullyPaid && !isCancelled && outstandingAmount > 0 && (
          <Card className="p-6 shadow-lg border border-gray-200">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-navy-blue mb-2 flex items-center gap-2">
                <CreditCard className="text-primary-blue" size={20} />
                {BOOKING_PAYMENT_FORM.title}
              </h2>
              <p className="text-sm text-gray-600">
                {BOOKING_PAYMENT_FORM.description(formatCurrency(outstandingAmount))}
              </p>
            </div>
            <PaymentForm
              bookingId={booking.id}
              amount={outstandingAmount}
              onPaymentComplete={handlePaymentComplete}
              onPaymentFailed={handlePaymentFailed}
              disabled={paymentStatus === 'processing' || paymentStatus === 'completed'}
              externalPaymentStatus={paymentStatus}
            />
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">{BOOKING_PAYMENT_FORM.secureTitle}</p>
                  <p>{BOOKING_PAYMENT_FORM.secureDescription}</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="mt-6">
          <Link href={ROUTES.BOOKING_BY_REFERENCE(booking.reference)}>
            <Button variant="outline" className="w-full">
              {BOOKING_PAYMENT_ACTIONS.backToBookingDetails}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPageClient;
