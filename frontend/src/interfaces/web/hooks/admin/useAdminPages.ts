/**
 * useAdminPages Hook (Interface Layer)
 *
 * Clean Architecture: Interface Layer (Adapters)
 * Purpose: React hook for admin public pages management
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminPages.ts
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { getApiErrorMessage, getApiValidationErrors } from '@/utils/errorUtils';
import type { AdminPageBlockDTO, PageBlockMetaDTO } from '@/core/application/pages/dto/PageDTO';
import type {
  AdminPageDTO,
  CreatePageDTO,
  UpdatePageDTO,
  TogglePublishDTO,
  AdminPagesFilters,
  RemotePagesListResponse,
  RemotePageResponse,
  mapRemotePageToAdminPageDTO,
} from '@/core/application/admin/dto/AdminPageDTO';

export interface CreateBlockDTO {
  type: string;
  payload?: Record<string, unknown>;
  meta?: PageBlockMetaDTO | null;
}

export interface UpdateBlockDTO {
  type?: string;
  payload?: Record<string, unknown>;
  meta?: PageBlockMetaDTO | null;
}

export interface UseAdminPagesResult {
  pages: AdminPageDTO[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  createPage: (data: CreatePageDTO) => Promise<AdminPageDTO>;
  updatePage: (id: string, data: UpdatePageDTO) => Promise<AdminPageDTO>;
  deletePage: (id: string) => Promise<void>;
  togglePublish: (id: string, data: TogglePublishDTO) => Promise<AdminPageDTO>;
  getPage: (id: string) => Promise<AdminPageDTO>;
  createBlock: (pageId: string, data: CreateBlockDTO) => Promise<AdminPageBlockDTO>;
  updateBlock: (pageId: string, blockId: string, data: UpdateBlockDTO) => Promise<AdminPageBlockDTO>;
  deleteBlock: (pageId: string, blockId: string) => Promise<void>;
  reorderBlocks: (pageId: string, blockIds: string[]) => Promise<AdminPageBlockDTO[]>;
  exportPages: () => Promise<void>;
  updateFilters: (filters: AdminPagesFilters) => void;
  refetch: () => Promise<void>;
}

export function useAdminPages(initialFilters: AdminPagesFilters = {}): UseAdminPagesResult {
  const [pages, setPages] = useState<AdminPageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminPagesFilters>(initialFilters);
  const [totalCount, setTotalCount] = useState(0);

  const { mapRemotePageToAdminPageDTO } = require('@/core/application/admin/dto/AdminPageDTO');

  /**
   * Fetch pages from API
   */
  const fetchPages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.published !== undefined) params.append('published', String(filters.published));

      const endpoint = params.toString()
        ? `${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}?${params.toString()}`
        : API_ENDPOINTS.ADMIN_PUBLIC_PAGES;

      const response = await apiClient.get<RemotePagesListResponse>(endpoint);

      if (response.data?.data) {
        const mapped = response.data.data.map(mapRemotePageToAdminPageDTO);
        setPages(mapped as AdminPageDTO[]);
        setTotalCount(mapped.length);
      } else {
        setPages([]);
        setTotalCount(0);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch pages:', err);
      setError(getApiErrorMessage(err, 'Failed to load pages'));
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /** Timeout for create/update (large rich-text payloads can be slow). */
  const PAGE_SAVE_TIMEOUT_MS = 30_000;

  /**
   * Create a new page
   */
  const createPage = async (data: CreatePageDTO): Promise<AdminPageDTO> => {
    try {
      const payload = { ...data };
      if (Array.isArray(payload.core_values) && (payload.coreValuesSectionTitle !== undefined || payload.coreValuesSectionSubtitle !== undefined)) {
        payload.core_values = [...payload.core_values];
        payload.core_values[0] = { ...(payload.core_values[0] || {}), sectionTitle: payload.coreValuesSectionTitle ?? '', sectionSubtitle: payload.coreValuesSectionSubtitle ?? '' } as CreatePageDTO['core_values'] extends (infer E)[] ? E : never;
      }
      const response = await apiClient.post<RemotePageResponse>(
        API_ENDPOINTS.ADMIN_PUBLIC_PAGES,
        payload,
        { timeout: PAGE_SAVE_TIMEOUT_MS }
      );

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      const newPage = mapRemotePageToAdminPageDTO(response.data);
      
      // Refetch to update list
      await fetchPages();
      
      return newPage;
    } catch (err: unknown) {
      console.error('Failed to create page:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to create page'));
    }
  };

  /**
   * Update an existing page
   */
  const updatePage = async (id: string, data: UpdatePageDTO): Promise<AdminPageDTO> => {
    try {
      // Backend expects snake_case; send only defined fields
      const payload: Record<string, unknown> = {};
      if (data.title !== undefined) payload.title = data.title;
      if (data.slug !== undefined) payload.slug = data.slug;
      if (data.type !== undefined) payload.type = data.type;
      if (data.content !== undefined) payload.content = data.content;
      if (data.summary !== undefined) payload.summary = data.summary;
      if (data.effective_date !== undefined) payload.effective_date = data.effective_date;
      if (data.version !== undefined) payload.version = data.version;
      if (data.published !== undefined) payload.published = data.published;
      if (data.mission !== undefined) payload.mission = data.mission;
      if (data.core_values !== undefined) {
        const cv = Array.isArray(data.core_values) ? [...data.core_values] : [];
        if (data.coreValuesSectionTitle !== undefined || data.coreValuesSectionSubtitle !== undefined) {
          cv[0] = { ...(cv[0] || {}), sectionTitle: data.coreValuesSectionTitle ?? '', sectionSubtitle: data.coreValuesSectionSubtitle ?? '' } as UpdatePageDTO['core_values'] extends (infer E)[] ? E : never;
        }
        payload.core_values = cv;
      }
      if (data.safeguarding !== undefined) payload.safeguarding = data.safeguarding;

      const response = await apiClient.put<RemotePageResponse>(
        `${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}/${id}`,
        payload,
        { timeout: PAGE_SAVE_TIMEOUT_MS }
      );

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      const updatedPage = mapRemotePageToAdminPageDTO(response.data);

      // Update local state optimistically
      setPages((prev) => prev.map((p) => (p.id === id ? updatedPage : p)));

      return updatedPage;
    } catch (err: unknown) {
      console.error('Failed to update page:', err);
      const apiMessage = getApiErrorMessage(err, 'Failed to update page');
      const validation = getApiValidationErrors(err);
      throw new Error(validation ? `${apiMessage} ${validation}`.trim() : apiMessage);
    }
  };

  /**
   * Delete a page
   */
  const deletePage = async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}/${id}`);
      
      // Update local state optimistically
      setPages((prev) => prev.filter((p) => p.id !== id));
      setTotalCount((prev) => prev - 1);
    } catch (err: unknown) {
      console.error('Failed to delete page:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to delete page'));
    }
  };

  /**
   * Toggle publish status
   */
  const togglePublish = async (id: string, data: TogglePublishDTO): Promise<AdminPageDTO> => {
    try {
      const payload = { published: data.published };
      const response = await apiClient.put<RemotePageResponse>(
        `${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}/${id}/publish`,
        payload
      );

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      const updatedPage = mapRemotePageToAdminPageDTO(response.data);

      setPages((prev) => prev.map((p) => (p.id === id ? updatedPage : p)));

      return updatedPage;
    } catch (err: unknown) {
      console.error('Failed to toggle publish status:', err);
      const apiMessage = getApiErrorMessage(err, 'Failed to update publish status');
      const validation = getApiValidationErrors(err);
      throw new Error(validation ? `${apiMessage} ${validation}`.trim() : apiMessage);
    }
  };

  /**
   * Get a single page
   */
  const getPage = async (id: string): Promise<AdminPageDTO> => {
    try {
      const response = await apiClient.get<RemotePageResponse>(
        API_ENDPOINTS.ADMIN_PUBLIC_PAGE_BY_ID(id)
      );

      if (!response.data) {
        throw new Error('Invalid response from server');
      }

      return mapRemotePageToAdminPageDTO(response.data);
    } catch (err: unknown) {
      console.error('Failed to fetch page:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to load page'));
    }
  };

  /**
   * Create a page block
   */
  const createBlock = async (pageId: string, data: CreateBlockDTO): Promise<AdminPageBlockDTO> => {
    try {
      const response = await apiClient.post<AdminPageBlockDTO>(
        API_ENDPOINTS.ADMIN_PUBLIC_PAGE_BLOCKS(pageId),
        { type: data.type, payload: data.payload ?? {}, meta: data.meta ?? undefined }
      );
      if (!response.data) throw new Error('Invalid response from server');
      return response.data;
    } catch (err: unknown) {
      console.error('Failed to create block:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to create block'));
    }
  };

  /**
   * Update a page block
   */
  const updateBlock = async (
    pageId: string,
    blockId: string,
    data: UpdateBlockDTO
  ): Promise<AdminPageBlockDTO> => {
    try {
      const payload: Record<string, unknown> = {};
      if (data.type !== undefined) payload.type = data.type;
      if (data.payload !== undefined) payload.payload = data.payload;
      if (data.meta !== undefined) payload.meta = data.meta;
      const response = await apiClient.put<AdminPageBlockDTO>(
        API_ENDPOINTS.ADMIN_PUBLIC_PAGE_BLOCK(pageId, blockId),
        payload
      );
      if (!response.data) throw new Error('Invalid response from server');
      return response.data;
    } catch (err: unknown) {
      console.error('Failed to update block:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to update block'));
    }
  };

  /**
   * Delete a page block
   */
  const deleteBlock = async (pageId: string, blockId: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN_PUBLIC_PAGE_BLOCK(pageId, blockId));
    } catch (err: unknown) {
      console.error('Failed to delete block:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to delete block'));
    }
  };

  /**
   * Reorder page blocks (blockIds = ordered array of block ids).
   */
  const reorderBlocks = async (
    pageId: string,
    blockIds: string[]
  ): Promise<AdminPageBlockDTO[]> => {
    try {
      const numericIds = blockIds.map((id) => parseInt(String(id), 10));
      const response = await apiClient.put<AdminPageBlockDTO[]>(
        API_ENDPOINTS.ADMIN_PUBLIC_PAGE_BLOCKS_REORDER(pageId),
        { blockIds: numericIds }
      );
      if (!response.data || !Array.isArray(response.data)) throw new Error('Invalid response from server');
      return response.data;
    } catch (err: unknown) {
      console.error('Failed to reorder blocks:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to reorder blocks'));
    }
  };

  /**
   * Export pages to CSV
   */
  const exportPages = async (): Promise<void> => {
    try {
      const response = await apiClient.get<{ filename: string; content: string[][] }>(
        `${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}/export`
      );

      if (!response.data?.filename || !response.data?.content) {
        throw new Error('Invalid response from server');
      }

      const { filename, content } = response.data;
      const csvContent = content.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: unknown) {
      console.error('Failed to export pages:', err);
      throw new Error(getApiErrorMessage(err, 'Failed to export pages'));
    }
  };

  /**
   * Update filters and refetch
   */
  const updateFilters = (newFilters: AdminPagesFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  /**
   * Refetch pages
   */
  const refetch = async () => {
    await fetchPages();
  };

  // Fetch pages on mount and when filters change
  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  return {
    pages,
    loading,
    error,
    totalCount,
    createPage,
    updatePage,
    deletePage,
    togglePublish,
    getPage,
    createBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    exportPages,
    updateFilters,
    refetch,
  };
}
