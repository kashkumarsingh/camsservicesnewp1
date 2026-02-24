'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/** Longer timeout for aggregate endpoint (multiple queries: testimonials, external reviews, provider summaries). */
const REVIEWS_AGGREGATE_TIMEOUT_MS = 25_000;

export interface ReviewProviderSummary {
  id: string;
  provider: string;
  displayName: string;
  locationId: string | null;
  isActive: boolean;
  lastSyncedAt?: string | null;
  lastSyncAttemptAt?: string | null;
  syncFrequencyMinutes: number;
  reviewCount: number;
  averageRating?: number | null;
}

export interface ReviewAggregateResult {
  testimonials: any[];
  externalReviews: any[];
  providerSummaries: ReviewProviderSummary[];
}

interface UseReviewAggregateState {
  data: ReviewAggregateResult | null;
  loading: boolean;
  error: Error | null;
}

export function useReviewAggregate(providers?: string[]) {
  const [state, setState] = useState<UseReviewAggregateState>({
    data: null,
    loading: true,
    error: null,
  });

  // Create stable dependency to prevent unnecessary re-fetches when array reference changes
  const providersKey = useMemo(() => providers?.join(',') || '', [providers?.join(',')]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchAggregate = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        const query = providersKey ? `?providers=${providersKey}` : '';
        const response = await apiClient.get<ReviewAggregateResult>(
          `${API_ENDPOINTS.REVIEWS_AGGREGATE}${query}`,
          { signal: controller.signal, timeout: REVIEWS_AGGREGATE_TIMEOUT_MS }
        );
        setState({ data: response.data, loading: false, error: null });
      } catch (error: any) {
        // Silently ignore abort errors (component unmounted or providers changed)
        if (controller.signal.aborted || error?.code === 'NETWORK_ERROR' && error?.message?.includes('aborted')) {
          return;
        }
        setState({
          data: null,
          loading: false,
          error: error instanceof Error ? error : new Error('Failed to load review aggregate'),
        });
      }
    };

    fetchAggregate();

    return () => controller.abort();
  }, [providersKey]);

  return state;
}


