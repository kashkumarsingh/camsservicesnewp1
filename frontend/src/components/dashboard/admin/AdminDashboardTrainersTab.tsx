'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserCheck, Calendar, UserCircle, ExternalLink, MapPin, Star, Clock, CalendarCheck } from 'lucide-react';
import { AdminTrainerAvailabilityPanel } from '@/components/dashboard/admin/AdminTrainerAvailabilityPanel';
import { useAdminDashboardStats } from '@/interfaces/web/hooks/dashboard/useAdminDashboardStats';
import { useAdminTrainers } from '@/interfaces/web/hooks/admin/useAdminTrainers';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { AdminTrainerDTO } from '@/core/application/admin/dto/AdminTrainerDTO';
import { TrainerSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

interface AdminDashboardTrainersTabProps {
  /** Optional: limit number of trainer cards shown (default 12). */
  trainerCardLimit?: number;
}

interface AvailabilitySlot {
  date: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return DAY_NAMES[d.getDay()] ?? dateStr;
}

/** Build a short one-line availability summary from slots (this week). */
function formatAvailabilitySummary(slots: AvailabilitySlot[]): string {
  if (!slots?.length) return '—';
  const key = (s: AvailabilitySlot) => `${s.startTime}-${s.endTime}`;
  const byTime = new Map<string, string[]>();
  for (const s of slots) {
    if (s.isAvailable !== false) {
      const k = key(s);
      const days = byTime.get(k) ?? [];
      days.push(getDayName(s.date));
      byTime.set(k, days);
    }
  }
  const parts: string[] = [];
  for (const [timeRange, days] of byTime) {
    const unique = [...new Set(days)].sort(
      (a, b) => DAY_NAMES.indexOf(a) - DAY_NAMES.indexOf(b)
    );
    const timeStr = timeRange.replace('-', '–');
    if (unique.length === 0) continue;
    if (unique.length >= 5 && unique.every((d) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(d))) {
      parts.push(`Mon–Fri ${timeStr}`);
    } else if (unique.length >= 2 && unique[0] === 'Mon' && unique[unique.length - 1] === 'Fri') {
      parts.push(`${unique[0]}–${unique[unique.length - 1]} ${timeStr}`);
    } else {
      parts.push(`${unique.join(', ')} ${timeStr}`);
    }
  }
  return parts.length > 0 ? parts.join('; ') : '—';
}

function formatLocations(postcodes: string[], max = 2): string {
  if (!postcodes?.length) return '—';
  const show = postcodes.slice(0, max);
  return show.join(', ') + (postcodes.length > max ? '…' : '');
}

// -----------------------------------------------------------------------------
// Trainer card (compact for dashboard)
// -----------------------------------------------------------------------------

interface TrainerCardProps {
  trainer: AdminTrainerDTO;
  /** Optional one-line availability summary (e.g. "Mon–Fri 09:00–17:00"). */
  availabilitySummary?: string;
  /** Opens the availability panel (synced from trainer dashboard). */
  onViewAvailability?: (trainer: AdminTrainerDTO) => void;
}

function TrainerCard({ trainer, availabilitySummary, onViewAvailability }: TrainerCardProps) {
  const router = useRouter();
  const locations = formatLocations(trainer.serviceAreaPostcodes ?? [], 2);
  const specialties = (trainer.specialties ?? []).slice(0, 3).join(', ') || '—';
  const notes = trainer.availabilityNotes?.trim();

  return (
    <article
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-700 dark:bg-slate-800/50"
      aria-labelledby={`trainer-name-${trainer.id}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex shrink-0 items-center gap-3">
          {trainer.image ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              <Image
                src={trainer.image}
                alt=""
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
              <UserCheck className="h-6 w-6" aria-hidden />
            </div>
          )}
          <div className="min-w-0">
            <h3 id={`trainer-name-${trainer.id}`} className="font-semibold text-slate-900 dark:text-slate-100 truncate">
              {trainer.name}
            </h3>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                trainer.isActive
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}
            >
              {trainer.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1 text-sm text-slate-600 dark:text-slate-400">
          {(availabilitySummary != null && availabilitySummary !== '—') && (
            <div className="flex items-center gap-1.5 truncate" title="Availability this week">
              <Clock className="h-4 w-4 shrink-0 text-slate-500" aria-hidden />
              <span className="truncate">{availabilitySummary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 shrink-0 text-amber-500" aria-hidden />
            <span>
              {trainer.rating != null && Number.isFinite(trainer.rating)
                ? `${Number(trainer.rating).toFixed(1)}${trainer.totalReviews != null && trainer.totalReviews > 0 ? ` (${trainer.totalReviews})` : ''}`
                : '—'}
            </span>
          </div>
          {specialties !== '—' && (
            <p className="truncate" title={trainer.specialties?.join(', ')}>
              {specialties}
            </p>
          )}
          {locations !== '—' && (
            <div className="flex items-center gap-1 truncate">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              <span title={trainer.serviceAreaPostcodes?.join(', ')}>{locations}</span>
            </div>
          )}
          {notes && (
            <p className="truncate text-slate-500 dark:text-slate-500" title={notes}>
              {notes}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3 dark:border-slate-700">
        <button
          type="button"
          onClick={() => onViewAvailability?.(trainer)}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60"
          title="View availability (synced from trainer dashboard)"
        >
          <CalendarCheck className="h-3.5 w-3.5" aria-hidden />
          View availability
        </button>
        <Link
          href={`/dashboard/admin/trainers?trainer=${trainer.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          <Calendar className="h-3.5 w-3.5" aria-hidden />
          View trainer
        </Link>
        <button
          type="button"
          onClick={() => router.push('/dashboard/admin/bookings')}
          className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
        >
          <UserCheck className="h-3.5 w-3.5" aria-hidden />
          Assign
        </button>
        <Link
          href="/dashboard/admin/trainers"
          className="inline-flex items-center gap-1 rounded-md bg-indigo-100 px-2.5 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
        >
          <UserCircle className="h-3.5 w-3.5" aria-hidden />
          Profile
        </Link>
      </div>
    </article>
  );
}

// -----------------------------------------------------------------------------
// Main tab component
// -----------------------------------------------------------------------------

/** This week (Mon–Sun) in local time for availability summary. */
function getThisWeekRange(): { dateFrom: string; dateTo: string } {
  const now = new Date();
  const day = now.getDay();
  const monOffset = day === 0 ? -6 : 1 - day;
  const mon = new Date(now);
  mon.setDate(now.getDate() + monOffset);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    dateFrom: `${mon.getFullYear()}-${pad(mon.getMonth() + 1)}-${pad(mon.getDate())}`,
    dateTo: `${sun.getFullYear()}-${pad(sun.getMonth() + 1)}-${pad(sun.getDate())}`,
  };
}

export function AdminDashboardTrainersTab({ trainerCardLimit = 12 }: AdminDashboardTrainersTabProps) {
  const router = useRouter();
  const { stats, loading: statsLoading } = useAdminDashboardStats();
  const { trainers, loading: trainersLoading } = useAdminTrainers({
    limit: trainerCardLimit,
  });
  const [availabilityTrainer, setAvailabilityTrainer] = useState<AdminTrainerDTO | null>(null);

  const weekRange = useMemo(() => getThisWeekRange(), []);
  const [availabilityByTrainerId, setAvailabilityByTrainerId] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await apiClient.get<{
          success: boolean;
          data: { trainers: { id: string; name: string; slots: AvailabilitySlot[] }[] };
        }>(
          `${API_ENDPOINTS.ADMIN_TRAINERS_AVAILABILITY}?date_from=${weekRange.dateFrom}&date_to=${weekRange.dateTo}`,
          { timeout: 10000 }
        );
        if (!cancelled && res?.data?.data?.trainers) {
          const map: Record<string, string> = {};
          for (const t of res.data.data.trainers) {
            map[t.id] = formatAvailabilitySummary(t.slots ?? []);
          }
          setAvailabilityByTrainerId(map);
        }
      } catch {
        if (!cancelled) setAvailabilityByTrainerId({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [weekRange.dateFrom, weekRange.dateTo]);

  const activeCount = stats?.trainers?.active ?? 0;
  const totalCount = stats?.trainers?.total ?? 0;
  const displayTrainers = trainers.slice(0, trainerCardLimit);
  const isLoading = statsLoading || trainersLoading;

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
      aria-labelledby="trainers-tab-heading"
    >
      <header className="border-b border-slate-200 px-6 py-4 dark:border-slate-700">
        <h2 id="trainers-tab-heading" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Trainers
        </h2>
        {!isLoading && (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {activeCount} active of {totalCount} total. Availability is synced from the trainer dashboard.
          </p>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => router.push('/dashboard/admin/trainers')}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
          >
            View all trainers
            <ExternalLink className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </header>

      <div className="p-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <TrainerSkeleton count={SKELETON_COUNTS.TRAINERS} />
          </div>
        ) : displayTrainers.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No trainers to show. Add trainers from the Trainers section.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {displayTrainers.map((trainer) => (
              <TrainerCard
                key={trainer.id}
                trainer={trainer}
                availabilitySummary={availabilityByTrainerId[trainer.id]}
                onViewAvailability={setAvailabilityTrainer}
              />
            ))}
          </div>
        )}
      </div>

      {availabilityTrainer && (
        <AdminTrainerAvailabilityPanel
          trainer={availabilityTrainer}
          isOpen={!!availabilityTrainer}
          onClose={() => setAvailabilityTrainer(null)}
        />
      )}
    </section>
  );
}
