'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { trainerBookingRepository } from '@/infrastructure/http/trainer/TrainerBookingRepository';
import type { TrainerBooking } from '@/core/application/trainer/types';
import BookingDetail from '@/components/trainer/bookings/BookingDetail';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';

interface BookingDetailPageClientProps {
  bookingId: string;
}

export default function BookingDetailPageClient({ bookingId }: BookingDetailPageClientProps) {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [booking, setBooking] = useState<TrainerBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(`/login?redirect=/dashboard/trainer/bookings/${bookingId}`);
      return;
    }

    if (!authLoading && user && user.role !== 'trainer') {
      router.push('/dashboard');
      return;
    }

    if (!authLoading && user && user.role === 'trainer' && user.approvalStatus !== 'approved') {
      router.push('/dashboard/trainer');
      return;
    }
  }, [authLoading, isAuthenticated, user, router, bookingId]);

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const bookingData = await trainerBookingRepository.get(parseInt(bookingId));
      setBooking(bookingData);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to load booking details';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'trainer' || user.approvalStatus !== 'approved') {
      return;
    }
    void fetchBooking();
  }, [authLoading, user, fetchBooking]);

  const trainerBookingDetailRefetch = useCallback(() => {
    if (user && user.role === 'trainer' && user.approvalStatus === 'approved') {
      void trainerBookingRepository.get(parseInt(bookingId)).then(setBooking).catch((err: unknown) => {
        setError(err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Failed to load booking details');
      });
    }
  }, [bookingId, user]);
  useLiveRefresh('bookings', trainerBookingDetailRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });
  useLiveRefresh('trainer_schedules', trainerBookingDetailRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });

  if (authLoading || loading) {
    return <DashboardSkeleton variant="trainer" />;
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard/trainer/bookings" className="inline-flex items-center text-primary-blue hover:text-light-blue-cyan mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/dashboard/trainer/bookings" className="inline-flex items-center text-primary-blue hover:text-light-blue-cyan mb-6">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Bookings
          </Link>
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-300">Booking not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/dashboard/trainer/bookings" className="inline-flex items-center text-primary-blue hover:text-light-blue-cyan mb-6">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Bookings
        </Link>

        <BookingDetail booking={booking} />
      </div>
    </div>
  );
}

