'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { isAdminRole } from '@/utils/dashboardConstants';
import {
  type AdminChildDTO,
  type CreateChildDTO,
  type UpdateChildDTO,
  type LinkParentDTO,
  type RejectChildDTO,
  type RemoteAdminChildResponse,
  mapRemoteChildToDTO,
} from '@/core/application/admin/dto/AdminChildDTO';

export type AdminChildRow = AdminChildDTO;

interface UseAdminChildrenOptions {
  approvalStatus?: string;
  ageMin?: number;
  ageMax?: number;
  parentId?: string;
  search?: string;
  /** "0" to filter only children with 0 remaining hours */
  hours?: string;
}

/**
 * useAdminChildren Hook
 *
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides full CRUD operations for admin children management
 */
export function useAdminChildren(options: UseAdminChildrenOptions = {}) {
  const { user, loading: authLoading } = useAuth();
  const [children, setChildren] = useState<AdminChildRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<boolean>(false);

  const fetchChildren = useCallback(
    async (silent = false) => {
      if (fetchingRef.current) {
        return;
      }

      if (authLoading) {
        return;
      }

      // Only admins and super_admins should use this hook
      if (!user || !isAdminRole(user.role)) {
        setLoading(false);
        setChildren([]);
        setError(null);
        return;
      }

      fetchingRef.current = true;
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        // Build query params
        const params = new URLSearchParams();
        if (options.approvalStatus) params.append('approval_status', options.approvalStatus);
        if (options.ageMin) params.append('age_min', String(options.ageMin));
        if (options.ageMax) params.append('age_max', String(options.ageMax));
        if (options.parentId) params.append('parent_id', options.parentId);
        if (options.search) params.append('search', options.search);
        if (options.hours === '0') params.append('hours', '0');

        const url = params.toString()
          ? `${API_ENDPOINTS.ADMIN_CHILDREN}?${params.toString()}`
          : API_ENDPOINTS.ADMIN_CHILDREN;

        // Collection response: { data: RemoteAdminChildResponse[], meta: {...} }
        const response = await apiClient.get<{
          data: RemoteAdminChildResponse[];
          meta?: { total_count?: number };
        }>(url);

        const remoteChildren = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const mapped: AdminChildRow[] = remoteChildren.map(mapRemoteChildToDTO);

        setChildren(mapped);
      } catch (err: unknown) {
        setError(getApiErrorMessage(err, 'Failed to load children'));
        setChildren([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    },
    [authLoading, user, options.approvalStatus, options.ageMin, options.ageMax, options.parentId, options.search, options.hours]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchChildren();
    }
  }, [authLoading, fetchChildren]);

  /**
   * Create a new child
   */
  const createChild = useCallback(
    async (data: CreateChildDTO): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminChildResponse>(
          API_ENDPOINTS.ADMIN_CHILDREN,
          data
        );

        const newChild = mapRemoteChildToDTO(response.data);
        
        // Optimistically update state
        setChildren((prev) => [newChild, ...prev]);

        return newChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to create child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Update an existing child
   */
  const updateChild = useCallback(
    async (id: string, data: UpdateChildDTO): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.put<RemoteAdminChildResponse>(
          `${API_ENDPOINTS.ADMIN_CHILDREN}/${id}`,
          data
        );

        const updatedChild = mapRemoteChildToDTO(response.data);

        // Optimistically update state
        setChildren((prev) =>
          prev.map((child) => (child.id === id ? updatedChild : child))
        );

        return updatedChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to update child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Delete a child
   */
  const deleteChild = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.delete(`${API_ENDPOINTS.ADMIN_CHILDREN}/${id}`);

        // Optimistically update state
        setChildren((prev) => prev.filter((child) => child.id !== id));
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to delete child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Approve a child (requires checklist already completed)
   */
  const approveChild = useCallback(
    async (id: string): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminChildResponse>(
          API_ENDPOINTS.ADMIN_CHILD_APPROVE(id)
        );

        const approvedChild = mapRemoteChildToDTO(response.data);

        setChildren((prev) =>
          prev.map((child) => (child.id === id ? approvedChild : child))
        );

        return approvedChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to approve child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Mark the child's checklist as completed (admin review) and auto-approve the child if pending.
   */
  const completeChecklist = useCallback(
    async (id: string): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminChildResponse>(
          API_ENDPOINTS.ADMIN_CHILD_COMPLETE_CHECKLIST(id)
        );

        const updatedChild = mapRemoteChildToDTO(response.data);

        setChildren((prev) =>
          prev.map((child) => (child.id === id ? updatedChild : child))
        );

        return updatedChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to complete checklist');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Reject a child
   */
  const rejectChild = useCallback(
    async (id: string, data?: RejectChildDTO): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminChildResponse>(
          `${API_ENDPOINTS.ADMIN_CHILDREN}/${id}/reject`,
          data || {}
        );

        const rejectedChild = mapRemoteChildToDTO(response.data);

        // Optimistically update state
        setChildren((prev) =>
          prev.map((child) => (child.id === id ? rejectedChild : child))
        );

        return rejectedChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to reject child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Notify parent to complete/update checklist
   */
  const notifyParentToCompleteChecklist = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.post(
          API_ENDPOINTS.ADMIN_CHILD_NOTIFY_PARENT(id)
        );
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to notify parent');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Link a child to a different parent
   */
  const linkParent = useCallback(
    async (id: string, data: LinkParentDTO): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminChildResponse>(
          `${API_ENDPOINTS.ADMIN_CHILDREN}/${id}/link-parent`,
          data
        );

        const linkedChild = mapRemoteChildToDTO(response.data);

        // Optimistically update state
        setChildren((prev) =>
          prev.map((child) => (child.id === id ? linkedChild : child))
        );

        return linkedChild;
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to link parent');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  /**
   * Get a single child by ID
   */
  const getChild = useCallback(
    async (id: string): Promise<AdminChildDTO> => {
      try {
        const response = await apiClient.get<RemoteAdminChildResponse>(
          `${API_ENDPOINTS.ADMIN_CHILDREN}/${id}`
        );

        return mapRemoteChildToDTO(response.data);
      } catch (err: unknown) {
        const message = getApiErrorMessage(err, 'Failed to load child');
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  return {
    children,
    loading,
    error,
    refetch: fetchChildren,
    createChild,
    updateChild,
    deleteChild,
    approveChild,
    completeChecklist,
    rejectChild,
    notifyParentToCompleteChecklist,
    linkParent,
    getChild,
  };
}

