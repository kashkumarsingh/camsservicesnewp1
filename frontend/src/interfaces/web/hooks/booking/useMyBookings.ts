'use client';

/**
 * useMyBookings Hook
 *
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides a composable way to fetch authenticated user's bookings.
 * When used inside dashboard (DashboardSyncProvider): cache-first behaviour so
 * returning to the tab/route shows last-known data immediately, then refetches in background.
 */

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import { ListBookingsUseCase } from '@/core/application/booking/useCases/ListBookingsUseCase';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { bookingRepository } from '@/infrastructure/persistence/booking';

export function useMyBookings() {
  const { user, loading: authLoading } = useAuth();
  const syncEnabled = useDashboardSyncEnabled();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<boolean>(false);
  const lastUserIdRef = useRef<string | number | null>(null);

  // Memoize the use case to prevent recreation on every render
  const listBookingsUseCase = useMemo(
    () => new ListBookingsUseCase(bookingRepository),
    []
  );

  const fetchBookings = useCallback(async (silent = false) => {
    // Prevent multiple simultaneous requests
    if (fetchingRef.current) {
      return;
    }

    if (authLoading || !user) {
      setLoading(false);
      return;
    }

    fetchingRef.current = true;
    if (!silent) {
      setLoading(true);
      setError(null);
    }

    try {
      // Backend automatically filters by authenticated user when no user_id is provided
      // The bookings endpoint is protected by auth:sanctum middleware
      const result = await listBookingsUseCase.execute({
        // No filters needed - backend will return bookings for authenticated user
      });
      
      // Deduplicate bookings by ID (in case backend returns duplicates)
      const seenIds = new Set<string | number>();
      const deduplicated = result.filter(booking => {
        if (seenIds.has(booking.id)) {
          console.warn('[useMyBookings] Duplicate booking detected and removed:', booking.id, booking.reference);
          return false;
        }
        seenIds.add(booking.id);
        return true;
      });

      // Sort by created date (newest first)
      const sorted = deduplicated.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.log('[useMyBookings] Fetched bookings:', {
          rawCount: result.length,
          deduplicatedCount: sorted.length,
          totalCount: sorted.length,
        });
      }

      setBookings(sorted);
      lastUserIdRef.current = user.id;
      if (syncEnabled) {
        dashboardSyncStore.setParentBookings(user.id, sorted);
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; statusText?: string; data?: unknown }; code?: string; message?: string; name?: string; stack?: string };
      const status = e?.response?.status;
      const isNetworkError = e?.code === 'NETWORK_ERROR' || !e?.response;

      if (status === 401) {
        setBookings([]);
        setError(null);
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.debug('[useMyBookings] Unauthenticated (401), showing empty list');
        }
        return;
      }

      if (isNetworkError) {
        setBookings([]);
        setError('Server unavailable. Ensure the backend is running (e.g. docker compose up -d backend).');
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
          console.debug('[useMyBookings] Network error (backend unreachable):', e?.message);
        }
        return;
      }

      const errorDetails: Record<string, unknown> = {
        message: e?.message ?? 'Unknown error',
        name: e?.name,
        stack: e?.stack,
      };

      if (e?.response) {
        errorDetails.response = {
          status: e.response.status,
          statusText: e.response.statusText,
          data: e.response.data,
        };
      }

      if (e?.code) {
        errorDetails.code = e.code;
      }

      try {
        errorDetails.serialized = JSON.stringify(err, err && typeof err === 'object' ? Object.getOwnPropertyNames(err) : [], 2);
      } catch {
        errorDetails.serialized = 'Unable to serialize error object';
      }

      console.error('Failed to fetch user bookings:', errorDetails);

      const data = e?.response?.data as { message?: string; error?: string } | undefined;
      const errorMessage =
        data?.message ||
        data?.error ||
        e?.message ||
        'Failed to load your bookings';

      setError(errorMessage);
      setBookings([]);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      fetchingRef.current = false;
    }
  }, [user, authLoading, listBookingsUseCase, syncEnabled]);

  useEffect(() => {
    if (!authLoading && !user) {
      setBookings([]);
      setLoading(false);
      lastUserIdRef.current = null;
      return;
    }
    if (!authLoading && user && user.id !== lastUserIdRef.current) {
      if (syncEnabled) {
        const cached = dashboardSyncStore.getParentBookings(user.id);
        if (cached?.bookings?.length !== undefined) {
          setBookings(cached.bookings as BookingDTO[]);
          setLoading(false);
          lastUserIdRef.current = user.id;
          void fetchBookings(true);
          return;
        }
      }
      lastUserIdRef.current = user.id;
      void fetchBookings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, authLoading, syncEnabled]);

  return {
    bookings,
    loading,
    error,
    refetch: fetchBookings,
  };
}

