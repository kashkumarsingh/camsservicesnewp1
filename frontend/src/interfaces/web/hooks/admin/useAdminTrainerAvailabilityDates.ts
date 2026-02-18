'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { TrainerAvailabilityDatesPayload } from '@/core/application/trainer/dto/TrainerAvailabilityDatesDTO';
import { parseAvailabilityDatesPayload } from '@/core/application/trainer/dto/TrainerAvailabilityDatesDTO';

/**
 * Fetch availability and unavailable dates for one trainer (synced from trainer dashboard).
 * Uses same API contract as trainer endpoint (GetTrainerAvailabilityDatesAction).
 * Used on admin trainer schedule page and availability panel.
 */
export function useAdminTrainerAvailabilityDates(
  trainerId: string,
  dateFrom: string,
  dateTo: string
) {
  const [dates, setDates] = useState<string[]>([]);
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDates = useCallback(async () => {
    if (!trainerId || !dateFrom || !dateTo) {
      setDates([]);
      setUnavailableDates([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
      const url = `${API_ENDPOINTS.ADMIN_TRAINER_AVAILABILITY_DATES(trainerId)}?${params.toString()}`;
      const response = await apiClient.get<{ data?: TrainerAvailabilityDatesPayload }>(url);
      const raw = response.data;
      const payload = raw && typeof raw === 'object' && 'data' in raw ? (raw as { data?: TrainerAvailabilityDatesPayload }).data : raw as TrainerAvailabilityDatesPayload | undefined;
      const result = parseAvailabilityDatesPayload(payload);
      setDates(result.availableDates);
      setUnavailableDates(result.unavailableDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load availability');
      setDates([]);
      setUnavailableDates([]);
    } finally {
      setLoading(false);
    }
  }, [trainerId, dateFrom, dateTo]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  return { dates, unavailableDates, loading, error, refetch: fetchDates };
}
