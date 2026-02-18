'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { trainerScheduleRepository } from '@/infrastructure/http/trainer/TrainerScheduleRepository';
import type { TrainerSchedule } from '@/core/application/trainer/types';
import ScheduleCalendar from '@/components/trainer/schedules/ScheduleCalendar';
import ScheduleList from '@/components/trainer/schedules/ScheduleList';
import TrainerSessionConfirmationPanel from '@/components/trainer/schedules/TrainerSessionConfirmationPanel';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Calendar, List, Bell } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';

const PENDING_CONFIRMATION = 'pending_trainer_confirmation';
type ViewMode = 'calendar' | 'list';

export default function SchedulesPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [schedules, setSchedules] = useState<TrainerSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const confirmScheduleId = searchParams.get('confirm');
  const declineScheduleId = searchParams.get('decline');
  const confirmationScheduleId =
    confirmScheduleId != null && confirmScheduleId !== ''
      ? parseInt(String(confirmScheduleId), 10)
      : declineScheduleId != null && declineScheduleId !== ''
        ? parseInt(String(declineScheduleId), 10)
        : null;
  const isConfirmationPanelOpen = confirmationScheduleId != null && !Number.isNaN(confirmationScheduleId);

  const pendingConfirmationSchedules = schedules.filter(
    (s) => (s.trainer_assignment_status ?? '') === PENDING_CONFIRMATION
  );
  const openConfirmPanelForSchedule = (scheduleId: number) => {
    router.replace(`/dashboard/trainer/schedules?confirm=${scheduleId}`, { scroll: false });
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard/trainer/schedules');
      return;
    }

    if (!authLoading && user && user.role !== 'trainer') {
      router.push('/dashboard');
      return;
    }

    if (!authLoading && user && user.role === 'trainer' && user.approval_status !== 'approved') {
      router.push('/dashboard/trainer');
      return;
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (authLoading || !user || user.role !== 'trainer' || user.approval_status !== 'approved') {
      return;
    }

    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await trainerScheduleRepository.list({
          month: selectedMonth,
          year: selectedYear,
        });
        setSchedules(response.schedules);
      } catch (err: any) {
        console.error('Failed to fetch schedules:', err);
        setError(err.message || 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [authLoading, user, selectedMonth, selectedYear]);

  const schedulesRefetch = useCallback(() => {
    if (!user || user.role !== 'trainer' || user.approval_status !== 'approved') return;
    trainerScheduleRepository
      .list({ month: selectedMonth, year: selectedYear })
      .then((response) => setSchedules(response.schedules))
      .catch(() => {});
  }, [user, selectedMonth, selectedYear]);
  useLiveRefresh('trainer_schedules', schedulesRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approval_status === 'approved',
  });
  useLiveRefresh('bookings', schedulesRefetch, {
    enabled: LIVE_REFRESH_ENABLED && !!user && user.role === 'trainer' && user.approval_status === 'approved',
  });

  const closeConfirmationPanel = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('confirm');
    url.searchParams.delete('decline');
    router.replace(url.pathname + url.search, { scroll: false });
  };

  const refreshSchedulesAfterConfirmation = () => {
    trainerScheduleRepository
      .list({ month: selectedMonth, year: selectedYear })
      .then((response) => setSchedules(response.schedules))
      .catch(() => {});
  };

  if (authLoading || loading) {
    return <DashboardSkeleton variant="trainer" />;
  }

  if (!user || user.role !== 'trainer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Schedule</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-300">View and manage your assigned schedules</p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setViewMode('calendar')}
              variant={viewMode === 'calendar' ? 'primary' : 'outline'}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant={viewMode === 'list' ? 'primary' : 'outline'}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {pendingConfirmationSchedules.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/50">
                  <Bell className="h-5 w-5 text-amber-700 dark:text-amber-300" aria-hidden />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    Session{pendingConfirmationSchedules.length > 1 ? 's' : ''} waiting for your confirmation
                  </h2>
                  <p className="mt-0.5 text-sm text-amber-800 dark:text-amber-200">
                    You have been assigned to {pendingConfirmationSchedules.length} session{pendingConfirmationSchedules.length > 1 ? 's' : ''}. Confirm or decline to continue.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={() => openConfirmPanelForSchedule(pendingConfirmationSchedules[0].id)}
                className="shrink-0"
              >
                Review & confirm
              </Button>
            </div>
          </div>
        )}

        {viewMode === 'calendar' ? (
          <ScheduleCalendar
            schedules={schedules}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={setSelectedMonth}
            onYearChange={setSelectedYear}
          />
        ) : (
          <ScheduleList schedules={schedules} />
        )}

        <TrainerSessionConfirmationPanel
          scheduleId={confirmationScheduleId}
          isOpen={isConfirmationPanelOpen}
          onClose={closeConfirmationPanel}
          onConfirmedOrDeclined={refreshSchedulesAfterConfirmation}
        />
      </div>
    </div>
  );
}

