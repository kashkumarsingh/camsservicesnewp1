'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { toastManager } from '@/utils/toast';
import { ROUTES } from '@/utils/routes';
import {
  CallbackLoadingCard,
  CallbackSuccessCard,
  CallbackCanceledCard,
  CallbackErrorCard,
} from '@/components/bookingsCallback';
import type { CallbackStatus } from '@/components/bookingsCallback';
import {
  CALLBACK_LOADING,
  CALLBACK_SUCCESS,
  CALLBACK_CANCELED,
  CALLBACK_ERROR,
  TOAST_COPY_SUCCESS,
} from '@/components/bookingsCallback/constants';

export default function BookingsCallbackPageClient() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<CallbackStatus>('loading');
  const [message, setMessage] = useState<string>('');
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [hasSessions, setHasSessions] = useState<boolean>(false);
  const hasProcessedRef = useRef(false);

  const { booking: canceledBooking, loading: loadingBooking } = useBooking(
    undefined,
    bookingReference ?? undefined
  );

  const confirmPaymentFromSession = useCallback(async (sessionId: string) => {
    if (hasProcessedRef.current) return;
    hasProcessedRef.current = true;
    setStatus('loading');
    setMessage(CALLBACK_LOADING.CONFIRMING);

    const endpoint = API_ENDPOINTS?.GET_PAYMENT_INTENT_FROM_SESSION;
    if (!endpoint || typeof endpoint !== 'string') {
      setStatus('success');
      setMessage(CALLBACK_SUCCESS.MESSAGE_FALLBACK);
      return;
    }

    try {
      const intentResponse = await apiClient.post<{ paymentIntentId: string }>(
        endpoint,
        { session_id: sessionId }
      );
      const paymentIntentId = intentResponse.data.paymentIntentId;
      if (!paymentIntentId) {
        setStatus('success');
        setMessage(CALLBACK_SUCCESS.MESSAGE_FALLBACK);
        return;
      }

      const confirmResult = await ApiPaymentService.confirmPayment(paymentIntentId);
      if (!confirmResult.success) {
        setStatus('success');
        setMessage(CALLBACK_SUCCESS.MESSAGE_FALLBACK);
        return;
      }

      const b = confirmResult.booking;
      if (b) {
        setBookingReference(b.reference ?? null);
        setBookingId(b.id ?? null);
        setHasSessions(
          (b as { hasSessions?: boolean; schedulesCount?: number }).hasSessions === true ||
          ((b as { has_sessions?: boolean; schedules_count?: number }).schedules_count ?? 0) > 0
        );
      }
      setStatus('success');
      setMessage(CALLBACK_SUCCESS.MESSAGE_DEFAULT);
    } catch {
      setStatus('success');
      setMessage(CALLBACK_SUCCESS.MESSAGE_FALLBACK);
    }
  }, []);

  useEffect(() => {
    if (hasProcessedRef.current) return;

    const paymentStatus = searchParams.get('payment');
    const sessionIdParam = searchParams.get('session_id');

    if (paymentStatus === 'success' && sessionIdParam) {
      confirmPaymentFromSession(sessionIdParam);
    } else if (paymentStatus === 'canceled') {
      hasProcessedRef.current = true;
      setStatus('canceled');
      setMessage(CALLBACK_CANCELED.RECOVERY_MESSAGE);
    } else if (paymentStatus === 'success' && !sessionIdParam) {
      hasProcessedRef.current = true;
      setStatus('success');
      setMessage(CALLBACK_SUCCESS.MESSAGE_NO_SESSION);
    } else if (!paymentStatus) {
      hasProcessedRef.current = true;
      setStatus('error');
      setMessage(CALLBACK_ERROR.MESSAGE);
    }
  }, [searchParams, confirmPaymentFromSession]);

  const handleCopyReference = (reference: string) => {
    navigator.clipboard.writeText(reference);
    toastManager.success(TOAST_COPY_SUCCESS);
  };

  const paymentHref =
    canceledBooking?.reference
      ? ROUTES.BOOKING_PAYMENT(canceledBooking.reference)
      : ROUTES.DASHBOARD_PARENT;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-white p-4">
      <div className="w-full max-w-2xl">
        {status === 'loading' && <CallbackLoadingCard />}

        {status === 'success' && (
          <CallbackSuccessCard
            message={message}
            bookingReference={bookingReference}
            bookingId={bookingId}
            hasSessions={hasSessions}
            onCopyReference={handleCopyReference}
            dashboardHref={ROUTES.DASHBOARD_PARENT}
            packagesHref={ROUTES.PACKAGES}
          />
        )}

        {status === 'canceled' && (
          <CallbackCanceledCard
            loadingBooking={loadingBooking}
            booking={canceledBooking}
            paymentHref={paymentHref}
            dashboardHref={ROUTES.DASHBOARD_PARENT}
          />
        )}

        {status === 'error' && (
          <CallbackErrorCard
            message={message}
            dashboardHref={ROUTES.DASHBOARD_PARENT}
            packagesHref={ROUTES.PACKAGES}
          />
        )}
      </div>
    </div>
  );
}
