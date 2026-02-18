'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

interface AdminTrainerAbsenceDatesResponse {
  success: boolean;
  data: { approved_dates: string[]; pending_dates: string[] };
  meta?: { date_from: string; date_to: string };
}

export function useAdminTrainerAbsenceDates(
  trainerId: string,
  dateFrom: string,
  dateTo: string
) {
  const [approvedDates, setApprovedDates] = useState<string[]>([]);
  const [pendingDates, setPendingDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchDates = useCallback(async () => {
    if (!trainerId || !dateFrom || !dateTo) {
      setApprovedDates([]); setPendingDates([]); setLoading(false); return;
    }
    try {
      setLoading(true); setError(null);
      const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
      const url = `${API_ENDPOINTS.ADMIN_TRAINER_ABSENCE_DATES(trainerId)}?${params.toString()}`;
      const response = await apiClient.get<AdminTrainerAbsenceDatesResponse>(url);
      const data = response.data?.data;
      setApprovedDates(data?.approved_dates ?? []);
      setPendingDates(data?.pending_dates ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load absence dates');
      setApprovedDates([]); setPendingDates([]);
    } finally { setLoading(false); }
  }, [trainerId, dateFrom, dateTo]);
  useEffect(() => { fetchDates(); }, [fetchDates]);
  return { approvedDates, pendingDates, loading, error, refetch: fetchDates };
}
