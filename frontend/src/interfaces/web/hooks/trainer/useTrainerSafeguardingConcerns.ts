'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getTrainerChildDisplayName } from '@/utils/trainerPrivacy';

export interface TrainerSafeguardingConcernItem {
  id: number;
  concernType: string;
  description: string;
  dateOfConcern: string | null;
  status: string;
  reportedByName: string | null;
  childName: string | null;
  createdAt: string;
  trainerAcknowledgedAt: string | null;
  trainerNote: string | null;
}

export interface UpdateTrainerConcernPayload {
  acknowledged?: boolean;
  note?: string | null;
}

interface TrainerSafeguardingConcernsResponse {
  concerns: TrainerSafeguardingConcernItem[];
}

export function useTrainerSafeguardingConcerns(enabled: boolean) {
  const [concerns, setConcerns] = useState<TrainerSafeguardingConcernItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConcerns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<TrainerSafeguardingConcernsResponse>(
        API_ENDPOINTS.TRAINER_SAFEGUARDING_CONCERNS
      );
      const rawConcerns = response.data?.concerns ?? [];
      // Enforce privacy: never expose full child name to trainer UI.
      const maskedConcerns = rawConcerns.map((c) => ({
        ...c,
        childName: c.childName ? getTrainerChildDisplayName(c.childName) : null,
      }));
      setConcerns(maskedConcerns);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Failed to load concerns.';
      setError(message);
      setConcerns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchConcerns();
    }
  }, [enabled, fetchConcerns]);

  const updateConcern = useCallback(
    async (concernId: number, payload: UpdateTrainerConcernPayload) => {
      await apiClient.patch<{ concern: TrainerSafeguardingConcernItem }>(
        API_ENDPOINTS.TRAINER_SAFEGUARDING_CONCERN_UPDATE(concernId),
        payload
      );
      await fetchConcerns();
    },
    [fetchConcerns]
  );

  return { concerns, loading, error, refetch: fetchConcerns, updateConcern };
}
