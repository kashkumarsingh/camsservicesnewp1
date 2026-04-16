/**
 * useAdminReviews Hook (Interface Layer)
 *
 * Purpose: List review sources, list/update external reviews, trigger sync, promote to testimonial.
 */

import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { getApiErrorMessage } from '@/shared/utils/errorUtils';
import type {
  AdminReviewSourceDTO,
  AdminExternalReviewDTO,
  AdminTestimonialDTO,
  CreateReviewSourceDTO,
  UpdateReviewSourceDTO,
  UpdateExternalReviewDTO,
  CreateTestimonialDTO,
  UpdateTestimonialDTO,
} from '@/core/application/admin/dto/AdminReviewDTO';
import { extractList } from '@/infrastructure/http/responseHelpers';

interface PaginatedMeta {
  currentPage?: number;
  perPage?: number;
  total?: number;
  lastPage?: number;
}

interface UseAdminReviewSourcesOptions {
  provider?: string;
  isActive?: boolean;
}

interface UseAdminExternalReviewsOptions {
  provider?: string;
  reviewSourceId?: string | number;
  isVisible?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

export function useAdminReviewSources(options: UseAdminReviewSourcesOptions = {}) {
  const [sources, setSources] = useState<AdminReviewSourceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (options.provider) params.append('provider', options.provider);
      if (options.isActive !== undefined) params.append('is_active', String(options.isActive));
      const url = params.toString()
        ? `${API_ENDPOINTS.ADMIN_REVIEW_SOURCES}?${params.toString()}`
        : API_ENDPOINTS.ADMIN_REVIEW_SOURCES;
      const response = await apiClient.get<{ data: AdminReviewSourceDTO[] }>(url);
      const list = extractList(response);
      setSources(Array.isArray(list) ? list : []);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load review sources'));
      setSources([]);
    } finally {
      setLoading(false);
    }
  }, [options.provider, options.isActive]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const createSource = useCallback(
    async (data: CreateReviewSourceDTO): Promise<AdminReviewSourceDTO> => {
      const response = await apiClient.post<AdminReviewSourceDTO>(API_ENDPOINTS.ADMIN_REVIEW_SOURCES, data);
      if (!response.data) throw new Error('Failed to create review source');
      await fetchSources();
      return response.data;
    },
    [fetchSources]
  );

  const updateSource = useCallback(
    async (id: string, data: UpdateReviewSourceDTO): Promise<AdminReviewSourceDTO> => {
      const response = await apiClient.put<AdminReviewSourceDTO>(API_ENDPOINTS.ADMIN_REVIEW_SOURCE_BY_ID(id), data);
      if (!response.data) throw new Error('Failed to update review source');
      await fetchSources();
      return response.data;
    },
    [fetchSources]
  );

  const syncSource = useCallback(
    async (id: string): Promise<void> => {
      await apiClient.post(API_ENDPOINTS.ADMIN_REVIEW_SOURCE_SYNC(id), {});
      await fetchSources();
    },
    [fetchSources]
  );

  return {
    sources,
    loading,
    error,
    refetch: fetchSources,
    createSource,
    updateSource,
    syncSource,
  };
}

export function useAdminExternalReviews(options: UseAdminExternalReviewsOptions = {}) {
  const [reviews, setReviews] = useState<AdminExternalReviewDTO[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (options.provider) params.append('provider', options.provider);
      if (options.reviewSourceId != null) params.append('review_source_id', String(options.reviewSourceId));
      if (options.isVisible !== undefined) params.append('is_visible', String(options.isVisible));
      if (options.search) params.append('search', options.search);
      if (options.page != null) params.append('page', String(options.page));
      if (options.perPage != null) params.append('per_page', String(options.perPage));
      const url = `${API_ENDPOINTS.ADMIN_EXTERNAL_REVIEWS}?${params.toString()}`;
      const response = await apiClient.get<{ data: AdminExternalReviewDTO[]; meta?: { pagination?: PaginatedMeta } }>(url);
      const raw = response.data;
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: AdminExternalReviewDTO[] }).data)) {
        const paginated = raw as { data: AdminExternalReviewDTO[]; meta?: { pagination?: PaginatedMeta } };
        setReviews(paginated.data);
        setMeta(paginated.meta?.pagination ?? null);
      } else if (Array.isArray(raw)) {
        setReviews(raw);
        setMeta(null);
      } else {
        setReviews([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load reviews'));
      setReviews([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [
    options.provider,
    options.reviewSourceId,
    options.isVisible,
    options.search,
    options.page,
    options.perPage,
  ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const updateReview = useCallback(
    async (id: string, data: UpdateExternalReviewDTO): Promise<AdminExternalReviewDTO> => {
      const response = await apiClient.patch<AdminExternalReviewDTO>(
        API_ENDPOINTS.ADMIN_EXTERNAL_REVIEW_BY_ID(id),
        data
      );
      if (!response.data) throw new Error('Failed to update review');
      await fetchReviews();
      return response.data;
    },
    [fetchReviews]
  );

  const promoteToTestimonial = useCallback(
    async (externalReviewId: string): Promise<void> => {
      await apiClient.post(API_ENDPOINTS.ADMIN_TESTIMONIAL_PROMOTE_FROM(externalReviewId), {});
      await fetchReviews();
    },
    [fetchReviews]
  );

  return {
    reviews,
    meta,
    loading,
    error,
    refetch: fetchReviews,
    updateReview,
    promoteToTestimonial,
  };
}

/** Convert camelCase DTO to snake_case for Laravel request body. */
function testimonialCreateToSnake(d: CreateTestimonialDTO): Record<string, unknown> {
  return {
    author_name: d.authorName,
    author_role: d.authorRole ?? null,
    quote: d.quote,
    rating: d.rating ?? null,
    source_type: d.sourceType ?? 'manual',
    source_label: d.sourceLabel ?? null,
    source_url: d.sourceUrl ?? null,
    locale: d.locale ?? null,
    published: d.published ?? true,
  };
}

function testimonialUpdateToSnake(d: UpdateTestimonialDTO): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (d.authorName !== undefined) out.author_name = d.authorName;
  if (d.authorRole !== undefined) out.author_role = d.authorRole;
  if (d.quote !== undefined) out.quote = d.quote;
  if (d.rating !== undefined) out.rating = d.rating;
  if (d.sourceLabel !== undefined) out.source_label = d.sourceLabel;
  if (d.sourceUrl !== undefined) out.source_url = d.sourceUrl;
  if (d.locale !== undefined) out.locale = d.locale;
  if (d.published !== undefined) out.published = d.published;
  return out;
}

interface UseAdminTestimonialsOptions {
  page?: number;
  perPage?: number;
  search?: string;
  published?: boolean;
  sourceType?: string;
}

export function useAdminTestimonials(options: UseAdminTestimonialsOptions = {}) {
  const [testimonials, setTestimonials] = useState<AdminTestimonialDTO[]>([]);
  const [meta, setMeta] = useState<PaginatedMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (options.page != null) params.append('page', String(options.page));
      if (options.perPage != null) params.append('per_page', String(options.perPage));
      if (options.search) params.append('search', options.search);
      if (options.published !== undefined) params.append('published', String(options.published));
      if (options.sourceType) params.append('source_type', options.sourceType);
      const url = `${API_ENDPOINTS.ADMIN_TESTIMONIALS}?${params.toString()}`;
      const response = await apiClient.get<{ data: AdminTestimonialDTO[]; meta?: { pagination?: PaginatedMeta } }>(url);
      const raw = response.data;
      if (raw && typeof raw === 'object' && 'data' in raw && Array.isArray((raw as { data: AdminTestimonialDTO[] }).data)) {
        const paginated = raw as { data: AdminTestimonialDTO[]; meta?: { pagination?: PaginatedMeta } };
        setTestimonials(paginated.data);
        setMeta(paginated.meta?.pagination ?? null);
      } else if (Array.isArray(raw)) {
        setTestimonials(raw);
        setMeta(null);
      } else {
        setTestimonials([]);
        setMeta(null);
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load testimonials'));
      setTestimonials([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [options.page, options.perPage, options.search, options.published, options.sourceType]);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const createTestimonial = useCallback(
    async (data: CreateTestimonialDTO): Promise<AdminTestimonialDTO> => {
      const response = await apiClient.post<AdminTestimonialDTO>(
        API_ENDPOINTS.ADMIN_TESTIMONIALS,
        testimonialCreateToSnake(data) as Record<string, unknown>
      );
      if (!response.data) throw new Error('Failed to create testimonial');
      await fetchTestimonials();
      return response.data;
    },
    [fetchTestimonials]
  );

  const updateTestimonial = useCallback(
    async (id: string, data: UpdateTestimonialDTO): Promise<AdminTestimonialDTO> => {
      const response = await apiClient.put<AdminTestimonialDTO>(
        API_ENDPOINTS.ADMIN_TESTIMONIAL_BY_ID(id),
        testimonialUpdateToSnake(data) as Record<string, unknown>
      );
      if (!response.data) throw new Error('Failed to update testimonial');
      await fetchTestimonials();
      return response.data;
    },
    [fetchTestimonials]
  );

  const deleteTestimonial = useCallback(
    async (id: string): Promise<void> => {
      await apiClient.delete(API_ENDPOINTS.ADMIN_TESTIMONIAL_BY_ID(id));
      await fetchTestimonials();
    },
    [fetchTestimonials]
  );

  return {
    testimonials,
    meta,
    loading,
    error,
    refetch: fetchTestimonials,
    createTestimonial,
    updateTestimonial,
    deleteTestimonial,
  };
}
