'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { adminTrainerAbsenceRequestRepository } from '@/infrastructure/http/admin/AdminTrainerAbsenceRequestRepository';
import type { AdminAbsenceRequestItem } from '@/infrastructure/http/admin/AdminTrainerAbsenceRequestRepository';
import { Breadcrumbs } from '@/components/dashboard/universal';
import { SideCanvas } from '@/components/ui/SideCanvas';
import { ROUTES } from '@/utils/routes';
import { BACK_TO_ADMIN_DASHBOARD_LABEL } from '@/utils/appConstants';
import { CheckCircle, Loader2, XCircle, CalendarOff, User, Calendar, FileText } from 'lucide-react';
import { useLiveRefresh } from '@/core/liveRefresh/LiveRefreshContext';
import { LIVE_REFRESH_ENABLED } from '@/utils/liveRefreshConstants';

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function AdminAbsenceRequestsPageClient() {
  const [requests, setRequests] = useState<AdminAbsenceRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdminAbsenceRequestItem | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminTrainerAbsenceRequestRepository.list();
      setRequests(data.requests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load absence requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  useLiveRefresh('trainer_availability', fetchList, { enabled: LIVE_REFRESH_ENABLED });

  const openPanel = useCallback((r: AdminAbsenceRequestItem) => {
    setSelectedRequest(r);
    setRejectReason('');
  }, []);

  const closePanel = useCallback(() => {
    setSelectedRequest(null);
    setRejectReason('');
  }, []);

  const handleApprove = useCallback(
    async (id: number) => {
      setActingId(id);
      try {
        await adminTrainerAbsenceRequestRepository.approve(id);
        closePanel();
        await fetchList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to approve');
      } finally {
        setActingId(null);
      }
    },
    [fetchList, closePanel]
  );

  const handleReject = useCallback(
    async (id: number, reason?: string) => {
      setActingId(id);
      try {
        await adminTrainerAbsenceRequestRepository.reject(id, reason || undefined);
        closePanel();
        await fetchList();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to reject');
      } finally {
        setActingId(null);
      }
    },
    [fetchList, closePanel]
  );

  const selectedId = selectedRequest?.id ?? null;
  const isActing = actingId !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <Breadcrumbs
          items={[
            { label: 'Admin', href: ROUTES.DASHBOARD_ADMIN },
            { label: 'Absence requests' },
          ]}
          trailing={
            <Link
              href={ROUTES.DASHBOARD_ADMIN}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              {BACK_TO_ADMIN_DASHBOARD_LABEL}
            </Link>
          }
        />
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Trainer absence requests
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
        Click a request to open details, then approve or reject. Once approved, dates show as absence on the trainer&apos;s calendar.
        </p>
      </header>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" aria-hidden />
        </div>
      ) : requests.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-8 text-center dark:border-slate-700 dark:bg-slate-800/50">
          <CalendarOff className="mx-auto h-10 w-10 text-slate-400" aria-hidden />
          <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-300">No pending absence requests</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">When trainers submit absences, they will appear here for approval.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => openPanel(r)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openPanel(r);
                }
              }}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={`View absence request: ${r.trainer_name}, ${formatDate(r.date_from)} to ${formatDate(r.date_to)}`}
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">{r.trainer_name}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {formatDate(r.date_from)} – {formatDate(r.date_to)}
                  {r.reason ? ` · ${r.reason}` : ''}
                </p>
              </div>
              <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded dark:bg-amber-900/40 dark:text-amber-200">
                Pending absence
              </span>
            </li>
          ))}
        </ul>
      )}

      <SideCanvas
        isOpen={selectedRequest !== null}
        onClose={closePanel}
        title={selectedRequest ? `${selectedRequest.trainer_name} – Absence request` : 'Absence request'}
        description={selectedRequest ? `${formatDate(selectedRequest.date_from)} – ${formatDate(selectedRequest.date_to)}` : undefined}
        footer={
          selectedRequest ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => selectedId !== null && handleApprove(selectedId)}
                disabled={isActing}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50 disabled:opacity-50"
              >
                {actingId === selectedId ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <CheckCircle className="h-4 w-4" aria-hidden />}
                Approve
              </button>
              <button
                type="button"
                onClick={() => selectedId !== null && handleReject(selectedId, rejectReason.trim() || undefined)}
                disabled={isActing}
                className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 disabled:opacity-50"
              >
                {actingId === selectedId ? null : <XCircle className="h-4 w-4" aria-hidden />}
                Reject
              </button>
            </div>
          ) : null
        }
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <User className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Trainer</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">{selectedRequest.trainer_name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                <Calendar className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Dates</p>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {formatDate(selectedRequest.date_from)} – {formatDate(selectedRequest.date_to)}
                </p>
              </div>
            </div>
            {selectedRequest.reason ? (
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  <FileText className="h-4 w-4 text-slate-600 dark:text-slate-300" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Reason</p>
                  <p className="text-slate-700 dark:text-slate-300">{selectedRequest.reason}</p>
                </div>
              </div>
            ) : null}
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Submitted {formatSubmittedAt((selectedRequest as { createdAt?: string; created_at?: string }).createdAt ?? (selectedRequest as { created_at?: string }).created_at ?? '')}
            </p>
            <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
              <label htmlFor="absence-reject-reason" className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Rejection reason (optional)
              </label>
              <textarea
                id="absence-reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Cover not available for these dates"
                rows={2}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-400"
                aria-describedby="reject-reason-hint"
              />
              <span id="reject-reason-hint" className="sr-only">
                Optional reason shown to the trainer when you reject this request.
              </span>
            </div>
          </div>
        )}
      </SideCanvas>
    </div>
  );
}
