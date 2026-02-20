'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/formatDate';
import { getStatusBadgeClasses, getPaymentStatusBadgeClasses } from '@/utils/statusBadgeHelpers';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ROUTES } from '@/utils/routes';
import {
  BookingDetailStateCard,
  BookingDetailHeader,
  BookingDetailMainCard,
  BOOKING_DETAIL_LOADING,
  BOOKING_DETAIL_ERROR,
  BOOKING_DETAIL_NOT_FOUND,
  BOOKING_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  BOOKING_DETAIL_ACTIONS,
} from '@/components/bookingDetail';

interface BookingDetailPageClientProps {
  reference: string;
}

const BookingDetailPageClient: React.FC<BookingDetailPageClientProps> = ({ reference }) => {
  const router = useRouter();
  const { booking, loading, error, refetch } = useBooking(undefined, reference);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  const handleRefreshPaymentStatus = async () => {
    if (!booking || refreshing) return;
    setRefreshing(true);
    setRefreshError(null);
    try {
      const response = await apiClient.post<{ success: boolean; message?: string }>(
        API_ENDPOINTS.BOOKING_REFRESH_PAYMENT(booking.id),
        {}
      );
      if (response.data?.success) {
        await refetch();
        setRefreshError(null);
      } else {
        setRefreshError(response.data?.message ?? 'Failed to refresh payment status');
      }
    } catch (err: unknown) {
      setRefreshError(err instanceof Error ? err.message : 'Failed to refresh payment status');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BookingDetailStateCard
            title=""
            message={BOOKING_DETAIL_LOADING.message}
            variant="loading"
            goBackLabel={BOOKING_DETAIL_ERROR.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_DETAIL_ERROR.goToDashboard}
          />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BookingDetailStateCard
            title={BOOKING_DETAIL_ERROR.title}
            message={error}
            variant="error"
            onGoBack={() => router.back()}
            goBackLabel={BOOKING_DETAIL_ERROR.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_DETAIL_ERROR.goToDashboard}
          />
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <BookingDetailStateCard
            title={BOOKING_DETAIL_NOT_FOUND.title}
            message={BOOKING_DETAIL_NOT_FOUND.description}
            variant="notFound"
            onGoBack={() => router.back()}
            goBackLabel={BOOKING_DETAIL_NOT_FOUND.goBack}
            goToDashboardHref={ROUTES.DASHBOARD_PARENT}
            goToDashboardLabel={BOOKING_DETAIL_NOT_FOUND.goToDashboard}
          />
        </div>
      </div>
    );
  }

  const statusLabel = BOOKING_STATUS_LABELS[booking.status.toLowerCase()] ?? booking.status;
  const paymentLabel =
    PAYMENT_STATUS_LABELS[booking.paymentStatus.toLowerCase()] ?? booking.paymentStatus;
  const statusBadgeClassName = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-medium border ${getStatusBadgeClasses(booking.status)}`;
  const paymentBadgeClassName = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-2xs font-medium border ${getPaymentStatusBadgeClasses(booking.paymentStatus)}`;
  const outstandingAmount =
    booking.outstandingAmount ?? booking.totalPrice - booking.paidAmount;
  const needsPaymentRefresh =
    (booking.status === 'draft' || booking.paymentStatus === 'pending') &&
    booking.paidAmount === 0 &&
    Boolean(booking.payments?.length);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <BookingDetailHeader
          reference={booking.reference}
          backHref={ROUTES.DASHBOARD_PARENT}
        />
        <BookingDetailMainCard
          booking={booking}
          statusLabel={statusLabel}
          paymentLabel={paymentLabel}
          statusBadgeClassName={statusBadgeClassName}
          paymentBadgeClassName={paymentBadgeClassName}
          outstandingAmount={outstandingAmount}
          needsPaymentRefresh={needsPaymentRefresh}
          refreshing={refreshing}
          refreshError={refreshError}
          onRefreshPayment={handleRefreshPaymentStatus}
          payOutstandingHref={ROUTES.BOOKING_PAYMENT(booking.reference)}
          payOutstandingLabel={BOOKING_DETAIL_ACTIONS.payOutstanding(
            formatCurrency(outstandingAmount)
          )}
          backToDashboardHref={ROUTES.DASHBOARD_PARENT}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export default BookingDetailPageClient;
