'use client';

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminBookings } from '@/interfaces/web/hooks/admin/useAdminBookings';
import type {
  AdminBookingDTO,
  AdminBookingsFilters,
  BookingStatus,
  PaymentStatus,
} from '@/core/application/admin/dto/AdminBookingDTO';
import SideCanvas from '@/components/ui/SideCanvas';
import { TableRowsSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { useLiveRefresh, useLiveRefreshContext } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

// ==========================================================================
// Helper Functions
// ==========================================================================

function formatDateTime(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getStatusBadgeClasses(status: BookingStatus) {
  switch (status) {
    case 'confirmed':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'pending':
    case 'draft':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'cancelled':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    case 'completed':
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function getPaymentStatusBadgeClasses(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    case 'partial':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
    case 'pending':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'refunded':
    case 'failed':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200';
  }
}

function getTrainerNames(booking: AdminBookingDTO): string {
  const trainerNames = Array.from(
    new Set(
      booking.sessions
        .map((s) => s.trainerName)
        .filter((name): name is string => !!name && name.trim().length > 0)
    )
  );

  if (trainerNames.length === 0) return 'Unassigned';
  if (trainerNames.length === 1) return trainerNames[0];
  return `${trainerNames[0]} +${trainerNames.length - 1}`;
}

function getPrimaryTrainerId(booking: AdminBookingDTO): string {
  const sessionWithTrainer = booking.sessions.find((session) => session.trainerId);
  return sessionWithTrainer?.trainerId ?? '';
}

// ==========================================================================
// Main Component
// ==========================================================================

export const AdminBookingsPageClient: React.FC = () => {
  const searchParams = useSearchParams();
  const needsTrainerFromUrl = searchParams.get('needs_trainer') === '1';

  const initialFilters = useMemo<AdminBookingsFilters>(() => {
    const f: AdminBookingsFilters = {};
    if (needsTrainerFromUrl) f.needs_trainer = true;
    return f;
  }, [needsTrainerFromUrl]);

  const {
    bookings,
    loading,
    error,
    totalCount,
    updateStatus,
    assignTrainer,
    getBooking,
    bulkCancel,
    bulkConfirm,
    exportBookings,
    updateFilters,
    fetchBookings,
  } = useAdminBookings(initialFilters);

  const liveRefreshContext = useLiveRefreshContext();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<AdminBookingDTO | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkOperationLoading, setBulkOperationLoading] = useState(false);

  const [assigningSessionId, setAssigningSessionId] = useState<string | null>(null);

  /** Per-session available trainers (conflict + availability + qualifications) for Assign dropdown */
  const [availableTrainersBySessionId, setAvailableTrainersBySessionId] = useState<
    Record<string, { id: string; name: string }[]>
  >({});

  /** Fetch available trainers for each session when side panel opens */
  const sessionIdsKey = useMemo(
    () => selectedBooking?.sessions?.map((s) => s.id).sort().join(',') ?? '',
    [selectedBooking]
  );
  useEffect(() => {
    const sessionIds = selectedBooking?.sessions?.map((s) => s.id) ?? [];
    if (sessionIds.length === 0) {
      setAvailableTrainersBySessionId({});
      return;
    }
    let cancelled = false;
    Promise.all(
      sessionIds.map(async (sessionId) => {
        try {
          const res = await apiClient.get<{
            trainers?: { id: string; name: string }[];
          }>(API_ENDPOINTS.ADMIN_BOOKING_AVAILABLE_TRAINERS(sessionId));
          const list = res?.data?.trainers ?? [];
          return { sessionId, list };
        } catch {
          return { sessionId, list: [] as { id: string; name: string }[] };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setAvailableTrainersBySessionId((prev) => {
        const next = { ...prev };
        results.forEach(({ sessionId, list }) => {
          next[sessionId] = list;
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [sessionIdsKey]);

  /** Options for a session's Assign dropdown: available trainers only; add current trainer to options only when API returned at least one (so we don't show a dropdown with just current when API said none available) */
  const getSessionTrainerOptions = useCallback(
    (session: AdminBookingDTO['sessions'][0]): { list: { id: string; name: string }[]; loading: boolean } => {
      const list = availableTrainersBySessionId[session.id];
      if (list === undefined) return { list: [], loading: true };
      const options = [...list];
      if (options.length > 0 && session.trainerId && session.trainerName && !options.some((t) => t.id === session.trainerId)) {
        options.unshift({ id: session.trainerId, name: session.trainerName });
      }
      return { list: options, loading: false };
    },
    [availableTrainersBySessionId]
  );

  /** First unassigned session id per booking (for table rows that need "Assign trainer" dropdown) */
  const bookingToFirstUnassignedSessionId = useMemo(() => {
    const map: Record<string, string> = {};
    bookings.forEach((b) => {
      const first = b.sessions.find((s) => !s.trainerId);
      if (first) map[b.id] = first.id;
    });
    return map;
  }, [bookings]);

  /** Available trainers per booking for table dropdown (same API as side panel – conflict, availability, qualified) */
  const [availableTrainersByBookingId, setAvailableTrainersByBookingId] = useState<
    Record<string, { list: { id: string; name: string }[]; loading: boolean }>
  >({});

  const bookingsNeedingTrainerKey = useMemo(
    () => Object.keys(bookingToFirstUnassignedSessionId).sort().join(','),
    [bookingToFirstUnassignedSessionId]
  );

  useEffect(() => {
    const bookingIds = Object.keys(bookingToFirstUnassignedSessionId);
    if (bookingIds.length === 0) {
      setAvailableTrainersByBookingId({});
      return;
    }
    setAvailableTrainersByBookingId((prev) => {
      const next = { ...prev };
      bookingIds.forEach((id) => {
        next[id] = { list: [], loading: true };
      });
      return next;
    });
    let cancelled = false;
    Promise.all(
      bookingIds.map(async (bookingId) => {
        const sessionId = bookingToFirstUnassignedSessionId[bookingId];
        if (!sessionId) return { bookingId, list: [] as { id: string; name: string }[] };
        try {
          const res = await apiClient.get<{
            trainers?: { id: string; name: string }[];
          }>(API_ENDPOINTS.ADMIN_BOOKING_AVAILABLE_TRAINERS(sessionId));
          const list = res?.data?.trainers ?? [];
          return { bookingId, list };
        } catch {
          return { bookingId, list: [] as { id: string; name: string }[] };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      setAvailableTrainersByBookingId((prev) => {
        const next = { ...prev };
        results.forEach(({ bookingId, list }) => {
          next[bookingId] = { list, loading: false };
        });
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, [bookingsNeedingTrainerKey, bookingToFirstUnassignedSessionId]);

  /** Options for table row "Assign trainer" dropdown: available trainers for this booking's first unassigned session */
  const getTableTrainerOptions = useCallback(
    (booking: AdminBookingDTO): { list: { id: string; name: string }[]; loading: boolean } => {
      const needsTrainer = booking.sessions.some((s) => !s.trainerId);
      const entry = availableTrainersByBookingId[booking.id];
      if (needsTrainer && (!entry || entry.loading)) {
        return { list: [], loading: true };
      }
      if (!entry) return { list: [], loading: false };
      const list = [...entry.list];
      // Only add current primary trainer to options when API returned at least one available trainer (so dropdown shows and we don't lose current choice). When API returned [], show "No available trainers" and do not add current trainer.
      if (list.length > 0) {
        const currentId = getPrimaryTrainerId(booking);
        const currentName = getTrainerNames(booking);
        if (currentId && currentName && currentName !== 'Unassigned' && !list.some((t) => t.id === currentId)) {
          list.unshift({ id: currentId, name: currentName });
        }
      }
      return { list, loading: false };
    },
    [availableTrainersByBookingId]
  );

  // Filtered bookings based on search
  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return bookings;

    return bookings.filter((b) => {
      const parentName = b.parentName.toLowerCase();
      const trainerNames = getTrainerNames(b).toLowerCase();
      const reference = b.reference.toLowerCase();
      const packageName = b.packageName?.toLowerCase() ?? '';
      return (
        reference.includes(term) ||
        parentName.includes(term) ||
        trainerNames.includes(term) ||
        packageName.includes(term)
      );
    });
  }, [bookings, search]);

  // Centralised live refresh: refetch when backend reports changes to bookings or trainer_schedules
  const adminBookingsRefetch = useCallback(() => fetchBookings(undefined, true), [fetchBookings]);
  useLiveRefresh('bookings', adminBookingsRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('trainer_schedules', adminBookingsRefetch, { enabled: LIVE_REFRESH_ENABLED });

  // Handle filter changes
  const handleFilterChange = (filters: AdminBookingsFilters) => {
    updateFilters(filters);
  };

  // Handle bulk selection
  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBookings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBookings.map((b) => b.id)));
    }
  };

  // Handle bulk operations
  const handleBulkCancel = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Cancel ${selectedIds.size} booking(s)?`)) return;

    try {
      setBulkOperationLoading(true);
      await bulkCancel({
        booking_ids: Array.from(selectedIds),
        cancellation_reason: 'Bulk cancelled by admin',
      });
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk cancel failed:', err);
    } finally {
      setBulkOperationLoading(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Confirm ${selectedIds.size} booking(s)?`)) return;

    try {
      setBulkOperationLoading(true);
      await bulkConfirm({
        booking_ids: Array.from(selectedIds),
      });
      setSelectedIds(new Set());
    } catch (err) {
      console.error('Bulk confirm failed:', err);
    } finally {
      setBulkOperationLoading(false);
    }
  };

  // Handle status update (inline)
  const handleStatusUpdate = async (
    bookingId: string,
    newStatus: BookingStatus
  ) => {
    try {
      await updateStatus(bookingId, { status: newStatus });
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  // Handle trainer assignment (per-session)
  const handleTrainerAssign = async (sessionId: string, trainerId: string) => {
    if (!trainerId || !selectedBooking) return;

    try {
      setAssigningSessionId(sessionId);
      await assignTrainer(sessionId, { trainer_id: trainerId });

      liveRefreshContext?.invalidate('notifications');
      liveRefreshContext?.invalidate('bookings');
      liveRefreshContext?.invalidate('trainer_schedules');

      // Refresh both table + side panel with latest data
      const updated = await getBooking(selectedBooking.id);
      setSelectedBooking(updated);
    } catch (err) {
      console.error('Trainer assignment failed:', err);
    } finally {
      setAssigningSessionId(null);
    }
  };

  // Handle primary trainer assignment across all sessions in a booking
  const handlePrimaryTrainerAssign = async (booking: AdminBookingDTO, trainerId: string) => {
    if (!trainerId) {
      // For now we only support assigning a specific trainer; unassign flow can be added later.
      return;
    }

    try {
      // Assign the same trainer to every session in this booking
      await Promise.all(
        booking.sessions.map((session) =>
          assignTrainer(session.id, { trainer_id: trainerId })
        )
      );
      liveRefreshContext?.invalidate('notifications');
      liveRefreshContext?.invalidate('bookings');
      liveRefreshContext?.invalidate('trainer_schedules');
    } catch (err) {
      console.error('Primary trainer assignment failed:', err);
    }
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportBookings();
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Bookings Management
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage all bookings, update statuses, assign trainers, and export data
        </p>
      </header>

      {/* Error Display */}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {/* Search + Filters + Export */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <input
              type="search"
              placeholder="Search by reference, parent, trainer or package..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full max-w-md rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {showFilters ? '✕ Hide Filters' : '⚙ Filters'}
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              📥 Export CSV
            </button>
          </div>
        </div>

        {/* Advanced Filters (collapsible) */}
        {showFilters && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Advanced Filters
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Booking Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    handleFilterChange({ status: e.target.value || undefined });
                  }}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-slate-300">
                  Payment Status
                </label>
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => {
                    setPaymentStatusFilter(e.target.value);
                    handleFilterChange({
                      payment_status: e.target.value || undefined,
                    });
                  }}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                >
                  <option value="">All Payment Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="partial">Partial</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('');
                    setPaymentStatusFilter('');
                    handleFilterChange({});
                  }}
                  className="inline-flex h-9 w-full items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 dark:border-indigo-900 dark:bg-indigo-950/40">
            <span className="text-xs font-medium text-indigo-900 dark:text-indigo-100">
              {selectedIds.size} selected
            </span>
            <button
              type="button"
              onClick={handleBulkConfirm}
              disabled={bulkOperationLoading}
              className="ml-auto inline-flex items-center rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
            >
              ✓ Bulk Confirm
            </button>
            <button
              type="button"
              onClick={handleBulkCancel}
              disabled={bulkOperationLoading}
              className="inline-flex items-center rounded-md bg-rose-600 px-2 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50"
            >
              ✕ Bulk Cancel
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="max-h-[420px] overflow-x-auto overflow-y-auto text-sm">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-950/40">
              <tr>
                <th className="px-3 py-2 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === filteredBookings.length &&
                      filteredBookings.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Ref
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Parent
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Package
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Booking status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Payment status
                </th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Trainers
                </th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
              {loading ? (
                <TableRowsSkeleton rowCount={SKELETON_COUNTS.TABLE_ROWS} colCount={8} />
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-3 py-4 text-center text-xs text-slate-500 dark:text-slate-400"
                  >
                    No bookings found.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr
                    key={booking.id}
                    className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    onClick={() => setSelectedBooking(booking)}
                  >
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(booking.id)}
                        onChange={() => toggleSelection(booking.id)}
                        onClick={(event) => event.stopPropagation()}
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {booking.reference}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {booking.parentName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      {booking.packageName || '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <select
                        value={booking.status}
                        onChange={(e) =>
                          handleStatusUpdate(booking.id, e.target.value as BookingStatus)
                        }
                        onClick={(event) => event.stopPropagation()}
                        className={`inline-flex rounded-full border-0 px-2 py-0.5 text-[11px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 ${getStatusBadgeClasses(
                          booking.status
                        )}`}
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getPaymentStatusBadgeClasses(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-xs text-slate-700 dark:text-slate-200">
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-slate-600 dark:text-slate-300">
                          {getTrainerNames(booking)}
                        </span>
                        {booking.sessions.some((s) => !s.trainerId) && (() => {
                          const { list, loading } = getTableTrainerOptions(booking);
                          if (loading) {
                            return (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Checking availability…
                              </span>
                            );
                          }
                          if (list.length === 0) {
                            return (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                No available trainers
                              </span>
                            );
                          }
                          return (
                            <select
                              value={getPrimaryTrainerId(booking)}
                              onChange={(event) =>
                                handlePrimaryTrainerAssign(booking, event.target.value)
                              }
                              onClick={(event) => event.stopPropagation()}
                              className="h-7 rounded-md border border-slate-300 bg-white px-2 text-[11px] text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                            >
                              <option value="">Assign trainer…</option>
                              {list.map((trainer) => (
                                <option key={trainer.id} value={trainer.id}>
                                  {trainer.name}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-xs">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          setSelectedBooking(booking);
                        }}
                        className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        👁️ View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <span>
            Showing {filteredBookings.length} of {totalCount} booking
            {totalCount === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Detail Side Panel */}
      <SideCanvas
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title={
          selectedBooking
            ? `Booking ${selectedBooking.reference}`
            : 'Booking details'
        }
        description={
          selectedBooking
            ? 'View booking details, sessions, and financial information'
            : undefined
        }
        widthClassName="md:w-[520px] lg:w-[640px]"
      >
        {selectedBooking && (
          <div className="space-y-4 text-sm">
            {/* Overview */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Overview
              </h3>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {selectedBooking.packageName ?? 'Package'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                  <span className="font-medium">
                    Ref {selectedBooking.reference}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getStatusBadgeClasses(
                      selectedBooking.status
                    )}`}
                  >
                    {selectedBooking.status}
                  </span>
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${getPaymentStatusBadgeClasses(
                      selectedBooking.paymentStatus
                    )}`}
                  >
                    {selectedBooking.paymentStatus}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Total £{selectedBooking.totalPrice.toFixed(2)} · Outstanding £
                  {(
                    selectedBooking.totalPrice - selectedBooking.paidAmount
                  ).toFixed(2)}
                </p>
              </div>
            </section>

            {/* Key Details */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Parent Information */}
              <section className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Parent information
                </h3>
                <dl className="grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
                  <div>
                    <dt className="font-medium">Name</dt>
                    <dd>{selectedBooking.parentName}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Email</dt>
                    <dd>{selectedBooking.parentEmail}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Phone</dt>
                    <dd>{selectedBooking.parentPhone}</dd>
                  </div>
                </dl>
              </section>

              {/* Financial & Hours */}
              <section className="space-y-1">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Financial & hours
                </h3>
                <dl className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200">
                  <div>
                    <dt className="font-medium">Total price</dt>
                    <dd>£{selectedBooking.totalPrice.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Paid amount</dt>
                    <dd>£{selectedBooking.paidAmount.toFixed(2)}</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Outstanding</dt>
                    <dd>
                      £
                      {(
                        selectedBooking.totalPrice - selectedBooking.paidAmount
                      ).toFixed(2)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium">Total hours</dt>
                    <dd>{selectedBooking.totalHours}h</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Booked hours</dt>
                    <dd>{selectedBooking.bookedHours}h</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Used hours</dt>
                    <dd>{selectedBooking.usedHours}h</dd>
                  </div>
                  <div>
                    <dt className="font-medium">Remaining hours</dt>
                    <dd>{selectedBooking.remainingHours}h</dd>
                  </div>
                </dl>
              </section>
            </div>

            {/* Children */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Children ({selectedBooking.children.length})
              </h3>
              {selectedBooking.children.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No children recorded.
                </p>
              ) : (
                <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-200">
                  {selectedBooking.children.map((child) => (
                    <li key={child.id}>{child.name}</li>
                  ))}
                </ul>
              )}
            </section>

            {/* Sessions */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sessions ({selectedBooking.sessionCount})
              </h3>
              {selectedBooking.sessions.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No sessions scheduled.
                </p>
              ) : (
                <ul className="space-y-2">
                  {selectedBooking.sessions.map((session) => (
                    <li
                      key={session.id}
                      className="rounded border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-900/60"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {formatDate(session.date)}
                        </span>
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClasses(
                            session.status as BookingStatus
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        {session.startTime} - {session.endTime}
                      </p>
                      <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Current trainer: {session.trainerName || 'Unassigned'}
                      </p>
                      <div className="mt-2">
                        <label className="mb-1 block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          Assign trainer
                        </label>
                        {(() => {
                          const { list, loading } = getSessionTrainerOptions(session);
                          if (loading) {
                            return (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                Checking availability…
                              </p>
                            );
                          }
                          if (list.length === 0) {
                            return (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                No available trainers
                              </p>
                            );
                          }
                          return (
                            <select
                              value={session.trainerId ?? ''}
                              onChange={(event) =>
                                handleTrainerAssign(session.id, event.target.value)
                              }
                              disabled={assigningSessionId === session.id}
                              className="h-8 w-full rounded-md border border-slate-300 bg-white px-2 text-xs text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-50"
                            >
                              <option value="">Unassigned</option>
                              {list.map((trainer) => (
                                <option key={trainer.id} value={trainer.id}>
                                  {trainer.name}
                                </option>
                              ))}
                            </select>
                          );
                        })()}
                        {assigningSessionId === session.id && (
                          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                            Saving trainer assignment…
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Audit */}
            <section className="space-y-1">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Audit
              </h3>
              <dl className="grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
                <div>
                  <dt className="font-medium">Created</dt>
                  <dd>{formatDateTime(selectedBooking.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Last Updated</dt>
                  <dd>{formatDateTime(selectedBooking.updatedAt)}</dd>
                </div>
              </dl>
            </section>
          </div>
        )}
      </SideCanvas>
    </section>
  );
};

