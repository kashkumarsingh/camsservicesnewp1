/**
 * useAdminBookings Hook (Interface Layer)
 *
 * Clean Architecture: Interface Layer (React Hook)
 * Purpose: Provides admin bookings management functionality.
 * When used with "today dashboard" filters inside dashboard (DashboardSyncProvider):
 * cache-first so returning to tab/route shows last-known data, then refetches in background.
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useDashboardSyncEnabled } from '@/core/dashboardSync/DashboardSyncContext';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type {
  AdminBookingDTO,
  RemoteBookingsListResponse,
  RemoteBookingResponse,
  UpdateBookingStatusDTO,
  AssignTrainerDTO,
  BulkCancelDTO,
  BulkConfirmDTO,
  UpdateBookingNotesDTO,
  AdminBookingsFilters,
} from '@/core/application/admin/dto/AdminBookingDTO';
import { mapRemoteBookingToAdminBookingDTO } from '@/core/application/admin/dto/AdminBookingDTO';

/** True when filters match the admin overview "today" single-day view (cacheable). */
function isTodayDashboardRequest(f: AdminBookingsFilters): boolean {
  return (
    !!f.session_date_from &&
    !!f.session_date_to &&
    f.session_date_from === f.session_date_to &&
    f.status === 'confirmed' &&
    f.payment_status === 'paid'
  );
}

export function useAdminBookings(initialFilters?: AdminBookingsFilters) {
  const { user } = useAuth();
  const userId = user?.id;
  const syncEnabled = useDashboardSyncEnabled();
  const [bookings, setBookings] = useState<AdminBookingDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AdminBookingsFilters>(
    initialFilters || {}
  );

  /**
   * Fetch bookings from backend with filters
   */
  const fetchBookings = useCallback(
    async (
      customFilters?: AdminBookingsFilters,
      /**
       * When true, avoids toggling the global loading state so we can
       * perform background refreshes (e.g. live polling) without
       * triggering table or dashboard spinners.
       */
      silent = false,
    ) => {
      try {
        if (!silent) {
          setLoading(true);
          setError(null);
        }

        const activeFilters = customFilters || filters;

        // Build query string
        const params = new URLSearchParams();
        if (activeFilters.status) params.append('status', activeFilters.status);
        if (activeFilters.payment_status)
          params.append('payment_status', activeFilters.payment_status);
        if (activeFilters.package_id)
          params.append('package_id', activeFilters.package_id);
        if (activeFilters.trainer_id)
          params.append('trainer_id', activeFilters.trainer_id);
        if (activeFilters.needs_trainer)
          params.append('needs_trainer', '1');
        if (activeFilters.parent_id)
          params.append('parent_id', activeFilters.parent_id);
        if (activeFilters.date_from)
          params.append('date_from', activeFilters.date_from);
        if (activeFilters.date_to)
          params.append('date_to', activeFilters.date_to);
        if (activeFilters.session_date_from)
          params.append('session_date_from', activeFilters.session_date_from);
        if (activeFilters.session_date_to)
          params.append('session_date_to', activeFilters.session_date_to);
        if (activeFilters.search) params.append('search', activeFilters.search);
        if (activeFilters.sort_by) params.append('sort_by', activeFilters.sort_by);
        if (activeFilters.order) params.append('order', activeFilters.order);
        if (activeFilters.limit)
          params.append('limit', String(activeFilters.limit));
        if (activeFilters.offset)
          params.append('offset', String(activeFilters.offset));

        const queryString = params.toString();
        const url = queryString
          ? `${API_ENDPOINTS.ADMIN_BOOKINGS}?${queryString}`
          : API_ENDPOINTS.ADMIN_BOOKINGS;

        const response = await apiClient.get<RemoteBookingsListResponse>(url);

        if (!response.data?.data) {
          throw new Error('Invalid response format from backend API');
        }

        const mapped = response.data.data.map((b) =>
          mapRemoteBookingToAdminBookingDTO(b)
        );
        setBookings(mapped);
        const count = response.data.meta?.total_count || mapped.length;
        setTotalCount(count);

        if (syncEnabled && userId && isTodayDashboardRequest(activeFilters) && activeFilters.session_date_from) {
          dashboardSyncStore.setAdminTodayBookings(
            userId,
            activeFilters.session_date_from,
            mapped,
            count
          );
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Failed to load bookings';
        setError(message);
        console.error('[useAdminBookings] fetchBookings error:', err);
      } finally {
        if (!silent) {
          setLoading(false);
        }
      }
    },
    [filters, syncEnabled, userId],
  );

  /**
   * Update booking status (draft → confirmed → completed/cancelled)
   */
  const updateStatus = useCallback(async (
    bookingId: string,
    statusData: UpdateBookingStatusDTO
  ): Promise<void> => {
    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: statusData.status,
                cancellationReason: statusData.cancellation_reason,
                cancelledAt:
                  statusData.status === 'cancelled'
                    ? new Date().toISOString()
                    : b.cancelledAt,
              }
            : b
        )
      );

      await apiClient.put(
        `${API_ENDPOINTS.ADMIN_BOOKINGS}/${bookingId}/status`,
        statusData
      );

      // Refetch to get latest data
      await fetchBookings(undefined, true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update booking status';
      setError(message);
      console.error('[useAdminBookings] updateStatus error:', err);
      // Revert optimistic update on error
      await fetchBookings();
      throw err;
    }
  }, [fetchBookings]);

  /**
   * Assign or reassign trainer to a session
   */
  const assignTrainer = useCallback(async (
    sessionId: string,
    trainerData: AssignTrainerDTO
  ): Promise<void> => {
    try {
      await apiClient.put(
        API_ENDPOINTS.ADMIN_BOOKING_ASSIGN_TRAINER(sessionId),
        trainerData
      );

      // Refetch to get latest data
      await fetchBookings();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to assign trainer to session';
      setError(message);
      console.error('[useAdminBookings] assignTrainer error:', err);
      throw err;
    }
  }, [fetchBookings]);

  /**
   * Bulk cancel bookings
   */
  const bulkCancel = useCallback(async (
    data: BulkCancelDTO
  ): Promise<number> => {
    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          data.booking_ids.includes(b.id)
            ? {
                ...b,
                status: 'cancelled',
                cancellationReason: data.cancellation_reason,
                cancelledAt: new Date().toISOString(),
              }
            : b
        )
      );

      const response = await apiClient.post<{ cancelled_count: number }>(
        `${API_ENDPOINTS.ADMIN_BOOKINGS}/bulk-cancel`,
        data
      );

      // Refetch to get latest data
      await fetchBookings(undefined, true);

      return response.data?.cancelled_count || 0;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to bulk cancel bookings';
      setError(message);
      console.error('[useAdminBookings] bulkCancel error:', err);
      // Revert optimistic update on error
      await fetchBookings();
      throw err;
    }
  }, [fetchBookings]);

  /**
   * Bulk confirm bookings
   */
  const bulkConfirm = useCallback(async (
    data: BulkConfirmDTO
  ): Promise<number> => {
    try {
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          data.booking_ids.includes(b.id)
            ? { ...b, status: 'confirmed' }
            : b
        )
      );

      const response = await apiClient.post<{ confirmed_count: number }>(
        `${API_ENDPOINTS.ADMIN_BOOKINGS}/bulk-confirm`,
        data
      );

      // Refetch to get latest data
      await fetchBookings(undefined, true);

      return response.data?.confirmed_count || 0;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to bulk confirm bookings';
      setError(message);
      console.error('[useAdminBookings] bulkConfirm error:', err);
      // Revert optimistic update on error
      await fetchBookings();
      throw err;
    }
  }, [fetchBookings]);

  /**
   * Update booking notes (admin notes or parent notes)
   */
  const updateNotes = useCallback(async (
    bookingId: string,
    notesData: UpdateBookingNotesDTO
  ): Promise<void> => {
    try {
      await apiClient.put(
        `${API_ENDPOINTS.ADMIN_BOOKINGS}/${bookingId}/notes`,
        notesData
      );

      // Update local state
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                adminNotes: notesData.admin_notes ?? b.adminNotes,
                notes: notesData.notes ?? b.notes,
              }
            : b
        )
      );
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update booking notes';
      setError(message);
      console.error('[useAdminBookings] updateNotes error:', err);
      throw err;
    }
  }, []);

  /**
   * Get single booking by ID
   */
  const getBooking = useCallback(async (
    bookingId: string
  ): Promise<AdminBookingDTO> => {
    try {
      const response = await apiClient.get<{ data: RemoteBookingResponse }>(
        `${API_ENDPOINTS.ADMIN_BOOKINGS}/${bookingId}`
      );

      const bookingData = response.data?.data ?? response.data;
      if (!bookingData) {
        throw new Error('Booking not found');
      }

      return mapRemoteBookingToAdminBookingDTO(bookingData as RemoteBookingResponse);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load booking';
      setError(message);
      console.error('[useAdminBookings] getBooking error:', err);
      throw err;
    }
  }, []);

  /**
   * Export bookings to CSV
   */
  const exportBookings = useCallback(async (
    customFilters?: AdminBookingsFilters
  ): Promise<void> => {
    try {
      const activeFilters = customFilters || filters;

      // Build query string (same as fetchBookings)
      const params = new URLSearchParams();
      if (activeFilters.status) params.append('status', activeFilters.status);
      if (activeFilters.payment_status)
        params.append('payment_status', activeFilters.payment_status);
      if (activeFilters.package_id)
        params.append('package_id', activeFilters.package_id);
      if (activeFilters.trainer_id)
        params.append('trainer_id', activeFilters.trainer_id);
      if (activeFilters.needs_trainer)
        params.append('needs_trainer', '1');
      if (activeFilters.parent_id)
        params.append('parent_id', activeFilters.parent_id);
      if (activeFilters.date_from)
        params.append('date_from', activeFilters.date_from);
      if (activeFilters.date_to)
        params.append('date_to', activeFilters.date_to);
      if (activeFilters.session_date_from)
        params.append('session_date_from', activeFilters.session_date_from);
      if (activeFilters.session_date_to)
        params.append('session_date_to', activeFilters.session_date_to);
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.sort_by) params.append('sort_by', activeFilters.sort_by);
      if (activeFilters.order) params.append('order', activeFilters.order);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.ADMIN_BOOKINGS}/export?${queryString}`
        : `${API_ENDPOINTS.ADMIN_BOOKINGS}/export`;

      // Fetch CSV as blob
      const response = await fetch(url, {
        headers: {
          Accept: 'text/csv',
        },
        credentials: 'include', // Include cookies for Sanctum auth
      });

      if (!response.ok) {
        throw new Error('Failed to export bookings');
      }

      // Download CSV file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `bookings-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to export bookings';
      setError(message);
      console.error('[useAdminBookings] exportBookings error:', err);
      throw err;
    }
  }, [filters]);

  /**
   * Update filters and refetch. Uses silent refetch so the table does not flicker
   * (skeleton) when only sort/filter changes — data updates in place.
   */
  const updateFilters = useCallback((newFilters: AdminBookingsFilters) => {
    setFilters(newFilters);
    fetchBookings(newFilters, true);
  }, [fetchBookings]);

  // Initial fetch: cache-first when sync enabled and this is the "today" dashboard request.
  // Deps use user?.id only (primitive) so we don't refetch when user object reference changes.
  // Note: Multiple GET /admin/bookings requests are expected when multiple components use this hook with different filters (e.g. overview "today" + schedule grid).
  useEffect(() => {
    if (syncEnabled && userId != null && isTodayDashboardRequest(filters) && filters.session_date_from) {
      const cached = dashboardSyncStore.getAdminTodayBookings(userId, filters.session_date_from);
      if (cached?.bookings != null) {
        setBookings(cached.bookings as AdminBookingDTO[]);
        setTotalCount(cached.totalCount);
        setLoading(false);
        void fetchBookings(undefined, true);
        return;
      }
    }
    if (syncEnabled && userId == null) return;
    void fetchBookings();
    // Intentionally omit fetchBookings to avoid re-running when it changes; we only run on sync/user change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncEnabled, userId]);

  return {
    bookings,
    loading,
    error,
    totalCount,
    filters,
    fetchBookings,
    updateStatus,
    assignTrainer,
    bulkCancel,
    bulkConfirm,
    updateNotes,
    getBooking,
    exportBookings,
    updateFilters,
  };
}
