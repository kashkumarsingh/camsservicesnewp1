/**
 * useAdminTrainer Hook (Interface Layer)
 *
 * Fetches a single trainer by ID via the admin API so admins can view any trainer
 * (including inactive). Use this on admin pages (e.g. schedule) instead of
 * useTrainer when the trainer may not be returned by the public API.
 */

'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

export interface AdminTrainerBasic {
  id: string;
  name: string;
  slug?: string;
}

export function useAdminTrainer(trainerId: string) {
  const [trainer, setTrainer] = useState<AdminTrainerBasic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!trainerId) {
      setTrainer(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.get<AdminTrainerBasic>(
          API_ENDPOINTS.ADMIN_TRAINER_BY_ID(trainerId)
        );
        const data = response.data;
        if (!cancelled && data) {
          setTrainer({
            id: String(data.id),
            name: data.name ?? '',
            slug: data.slug,
          });
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message =
          (err as { message?: string })?.message ??
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Failed to load trainer';
        setError(new Error(status === 404 ? 'Trainer not found' : message));
        setTrainer(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [trainerId]);

  return { trainer, loading, error };
}
