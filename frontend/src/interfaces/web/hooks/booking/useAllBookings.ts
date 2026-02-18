'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { ListBookingsUseCase } from '@/core/application/booking/useCases/ListBookingsUseCase';
import { bookingRepository } from '@/infrastructure/persistence/booking';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

/**
 * useAllBookings Hook (Admin)
 *
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides a composable way for admins to fetch all bookings
 */
export function useAllBookings() {
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<boolean>(false);

  const listBookingsUseCase = useMemo(
    () => new ListBookingsUseCase(bookingRepository),
    []
  );

  const fetchBookings = useCallback(async (silent = false) => {
    if (fetchingRef.current) {
      return;
    }

    if (authLoading) {
      return;
    }

    // Only admins and super_admins should use this hook
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      setLoading(false);
      setBookings([]);
      return;
    }

    fetchingRef.current = true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      const result = await listBookingsUseCase.execute();

      // Deduplicate by ID and sort by updated date (newest first)
      const seenIds = new Set<string | number>();
      const deduplicated = result.filter((booking) => {
        if (seenIds.has(booking.id)) {
          return false;
        }
        seenIds.add(booking.id);
        return true;
      });

      const sorted = deduplicated.sort(
        (a, b) =>
          new Date(b.updatedAt || b.createdAt).getTime() -
          new Date(a.updatedAt || a.createdAt).getTime()
      );

      setBookings(sorted);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load bookings';
      setError(message);
      setBookings([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [authLoading, user, listBookingsUseCase]);

  useEffect(() => {
    if (!authLoading) {
      fetchBookings();
    }
  }, [authLoading, fetchBookings]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}

