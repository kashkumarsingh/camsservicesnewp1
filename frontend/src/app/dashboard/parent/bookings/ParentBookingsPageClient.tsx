'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMyBookings } from '@/interfaces/web/hooks/booking/useMyBookings';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import type { BookingScheduleDTO } from '@/core/application/booking/dto/BookingDTO';
import {
  Breadcrumbs,
  DataTable,
  type Column,
  type SortDirection,
} from '@/components/dashboard/universal';
import Button from '@/components/ui/Button';
import BookedSessionsModal from '@/components/dashboard/modals/BookedSessionsModal';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';

/** Next upcoming session for a booking (by date then start time). */
function getNextSession(schedules: BookingScheduleDTO[] | undefined): string {
  if (!schedules?.length) return 'Not scheduled';
  const now = new Date();
  const upcoming = schedules
    .filter((s) => {
      const d = s.date && s.startTime ? new Date(`${s.date}T${s.startTime}`) : null;
      return d && d >= now && s.status !== 'cancelled';
    })
    .sort((a, b) => {
      const da = a.date && a.startTime ? `${a.date}T${a.startTime}` : '';
      const db = b.date && b.startTime ? `${b.date}T${b.startTime}` : '';
      return da.localeCompare(db);
    });
  const next = upcoming[0];
  if (!next?.date || !next?.startTime) return 'Not scheduled';
  return `${next.date} ${next.startTime}`;
}

/** Child name from first participant. */
function getChildName(booking: BookingDTO): string {
  const first = booking.participants?.[0];
  if (!first) return '—';
  return [first.firstName, first.lastName].filter(Boolean).join(' ') || '—';
}

function statusBadgeClass(status: string): string {
  const lower = status?.toLowerCase() ?? '';
  if (lower === 'confirmed') return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300';
  if (lower === 'draft') return 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300';
  if (lower === 'cancelled') return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

export default function ParentBookingsPageClient() {
  const router = useRouter();
  const { bookings, loading, refetch } = useMyBookings();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedBooking, setSelectedBooking] = useState<BookingDTO | null>(null);
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const parentBookingsRefetch = useCallback(() => void refetch(true), [refetch]);
  useLiveRefresh('bookings', parentBookingsRefetch, { enabled: LIVE_REFRESH_ENABLED });
  useLiveRefresh('children', parentBookingsRefetch, { enabled: LIVE_REFRESH_ENABLED });

  const filtered = useMemo(() => {
    let list = [...bookings];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (b) =>
          b.reference?.toLowerCase().includes(q) ||
          b.package?.name?.toLowerCase().includes(q) ||
          getChildName(b).toLowerCase().includes(q)
      );
    }
    if (sortKey) {
      list.sort((a, b) => {
        let aVal: string | number = '';
        let bVal: string | number = '';
        if (sortKey === 'reference') {
          aVal = a.reference ?? '';
          bVal = b.reference ?? '';
        } else if (sortKey === 'child') {
          aVal = getChildName(a);
          bVal = getChildName(b);
        } else if (sortKey === 'package') {
          aVal = a.package?.name ?? '';
          bVal = b.package?.name ?? '';
        } else if (sortKey === 'status') {
          aVal = a.status ?? '';
          bVal = b.status ?? '';
        } else {
          aVal = a.createdAt ?? '';
          bVal = b.createdAt ?? '';
        }
        const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
        return sortDirection === 'asc' ? cmp : -cmp;
      });
    }
    return list;
  }, [bookings, searchQuery, sortKey, sortDirection]);

  const columns: Column<BookingDTO>[] = useMemo(
    () => [
      {
        id: 'reference',
        header: 'Reference',
        sortable: true,
        accessor: (row) => (
          <span className="font-mono text-xs font-medium text-slate-900 dark:text-slate-50">
            {row.reference ?? '—'}
          </span>
        ),
      },
      {
        id: 'child',
        header: 'Child',
        sortable: true,
        accessor: (row) => getChildName(row),
      },
      {
        id: 'package',
        header: 'Package',
        sortable: true,
        accessor: (row) => row.package?.name ?? '—',
      },
      {
        id: 'status',
        header: 'Status',
        sortable: true,
        accessor: (row) => (
          <span
            className={
              'inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ' +
              statusBadgeClass(row.status ?? '')
            }
          >
            {row.status ?? '—'}
          </span>
        ),
      },
      {
        id: 'nextSession',
        header: 'Next session',
        sortable: false,
        accessor: (row) => getNextSession(row.schedules),
      },
    ],
    []
  );

  const handleSortChange = (columnId: string) => {
    if (sortKey === columnId) {
      setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(columnId);
      setSortDirection('asc');
    }
  };

  const handleOpenSessionsModal = (booking: BookingDTO) => {
    setSelectedBooking(booking);
    setShowSessionsModal(true);
  };

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Parent', href: '/dashboard/parent' },
            { label: 'Booked hours and packages' },
          ]}
        />
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Booked hours and packages
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          View and manage your booked hours and packages. Schedule sessions from a booking or buy more hours.
        </p>
      </header>

      <DataTable<BookingDTO>
        title=""
        description=""
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No bookings yet"
        emptyMessage="When you purchase a package or create a booking, it will appear here. You can then schedule sessions from the dashboard."
        searchable
        searchPlaceholder="Search by reference, child or package…"
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        sortable
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSortChange={handleSortChange}
        onAddClick={() => router.push('/dashboard/parent/schedule?open=booking')}
        addLabel="New booking"
        responsive
        renderRowActions={(row) => (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex rounded-md border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenSessionsModal(row);
              }}
            >
              View
            </button>
          </div>
        )}
        onRowClick={(row) => handleOpenSessionsModal(row)}
      />
      <BookedSessionsModal
        isOpen={showSessionsModal}
        onClose={() => {
          setShowSessionsModal(false);
          setSelectedBooking(null);
        }}
        booking={selectedBooking}
        childName={
          selectedBooking?.participants?.[0]
            ? `${selectedBooking.participants[0].firstName} ${selectedBooking.participants[0].lastName}`
            : undefined
        }
        onSessionCancelled={async () => {
          await refetch();
        }}
        onBookMoreSessions={() => {
          const primaryChildId = selectedBooking?.participants?.[0]?.childId;
          if (primaryChildId) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const yyyyMmDd = tomorrow.toISOString().slice(0, 10);
            router.push(
              `/dashboard/parent?bookDate=${yyyyMmDd}&bookChildId=${primaryChildId}`,
            );
          } else {
            router.push('/dashboard/parent');
          }
        }}
        onEditSession={(scheduleId) => {
          router.push(
            `/dashboard/parent?editSessionId=${encodeURIComponent(scheduleId)}`,
          );
        }}
      />
    </section>
  );
}
