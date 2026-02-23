'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { trainerBookingRepository } from '@/infrastructure/http/trainer/TrainerBookingRepository';
import type { TrainerBooking } from '@/core/application/trainer/types';
import BookingsList from '@/components/trainer/bookings/BookingsList';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { toastManager } from '@/utils/toast';

export default function BookingsListPageClient() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<TrainerBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/trainer/bookings');
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
  }, [authLoading, isAuthenticated, user, router]);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!user || user.role !== 'trainer' || user.approvalStatus !== 'approved') return;
    try {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      const response = await trainerBookingRepository.list();
      setBookings(response.bookings);
    } catch (err: any) {
      console.error('Failed to fetch bookings:', err);
      if (!silent) setError(err.message || 'Failed to load bookings');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'trainer' || user.approvalStatus !== 'approved') return;
    fetchBookings();
  }, [authLoading, user, fetchBookings]);

  const trainerBookingsRefetch = useCallback(() => fetchBookings(true), [fetchBookings]);
  useLiveRefresh('bookings', trainerBookingsRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });
  useLiveRefresh('trainer_schedules', trainerBookingsRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approvalStatus === 'approved',
  });

  if (authLoading || loading) {
    return <DashboardSkeleton variant="trainer" />;
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">View and manage your assigned bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <BookingsList bookings={bookings} />
      </div>
    </div>
  );
}

