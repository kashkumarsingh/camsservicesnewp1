'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import type {
  AdminUserDTO,
  CreateUserDTO,
  UpdateUserDTO,
  RemoteAdminUserResponse,
} from '@/core/application/admin/dto/AdminUserDTO';
import { mapRemoteUserToDTO } from '@/core/application/admin/dto/AdminUserDTO';
import { isAdminRole } from '@/utils/dashboardConstants';

export type AdminUserRow = AdminUserDTO;

export interface UseAdminUsersFilters {
  role?: string;
  approvalStatus?: string;
  search?: string;
}

/**
 * useAdminUsers Hook (Full CRUD)
 *
 * Clean Architecture Layer: Interface (Web Hooks)
 * Purpose: Provides complete CRUD operations for admin user management
 */
export function useAdminUsers(filters?: UseAdminUsersFilters) {
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef<boolean>(false);

  // Destructure filters to avoid object reference issues
  const roleFilter = filters?.role;
  const approvalStatusFilter = filters?.approvalStatus;
  const searchFilter = filters?.search;

  /**
   * Fetch all users with optional filters
   */
  const fetchUsers = useCallback(
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
        setUsers([]);
        setError(null);
        return;
      }

      fetchingRef.current = true;
      if (!silent) {
        setLoading(true);
        setError(null);
      }

      try {
        const params: Record<string, string> = {};

        if (roleFilter) {
          params.role = roleFilter;
        }
        if (approvalStatusFilter) {
          params.approval_status = approvalStatusFilter;
        }

        const query = new URLSearchParams(params).toString();
        const url = query ? `${API_ENDPOINTS.ADMIN_USERS}?${query}` : API_ENDPOINTS.ADMIN_USERS;

        // Collection response: { data: RemoteAdminUserResponse[], meta: {...} }
        const response = await apiClient.get<{
          data: RemoteAdminUserResponse[];
          meta?: { total_count?: number };
        }>(url);

        const remoteUsers = Array.isArray(response.data?.data)
          ? response.data.data
          : [];

        const mapped: AdminUserRow[] = remoteUsers.map((remote) =>
          mapRemoteUserToDTO(remote)
        );

        // Client-side search filter if provided
        let filtered = mapped;
        if (searchFilter) {
          const searchLower = searchFilter.toLowerCase();
          filtered = mapped.filter(
            (u) =>
              u.name.toLowerCase().includes(searchLower) ||
              u.email.toLowerCase().includes(searchLower)
          );
        }

        setUsers(filtered);
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          'Failed to load users';
        setError(message);
        setUsers([]);
      } finally {
        if (!silent) {
          setLoading(false);
        }
        fetchingRef.current = false;
      }
    },
    [authLoading, user, roleFilter, approvalStatusFilter, searchFilter]
  );

  /**
   * Get a single user by ID
   */
  const getUserById = useCallback(async (id: string): Promise<AdminUserDTO | null> => {
    try {
      const response = await apiClient.get<RemoteAdminUserResponse>(
        API_ENDPOINTS.ADMIN_USER_BY_ID(id)
      );
      return mapRemoteUserToDTO(response.data);
    } catch (err: any) {
      throw new Error(err?.response?.data?.message || 'Failed to fetch user');
    }
  }, []);

  /**
   * Create a new user
   */
  const createUser = useCallback(
    async (data: CreateUserDTO): Promise<AdminUserDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminUserResponse>(
          API_ENDPOINTS.ADMIN_USERS,
          data
        );
        const newUser = mapRemoteUserToDTO(response.data);

        // Optimistic: add new user to list immediately so they appear without waiting for refetch
        setUsers((prev) => [newUser, ...prev]);

        // Refetch in background to keep list in sync with server (e.g. sort, counts)
        fetchUsers(true);

        return newUser;
      } catch (err: any) {
        throw new Error(err?.response?.data?.message || 'Failed to create user');
      }
    },
    [fetchUsers]
  );

  /**
   * Update an existing user
   */
  const updateUser = useCallback(
    async (id: string, data: UpdateUserDTO): Promise<AdminUserDTO> => {
      try {
        const response = await apiClient.put<RemoteAdminUserResponse>(
          API_ENDPOINTS.ADMIN_USER_BY_ID(id),
          data
        );
        const updated = mapRemoteUserToDTO(response.data);
        
        // Update local state optimistically
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? updated : u))
        );
        
        return updated;
      } catch (err: any) {
        // Refetch on error to ensure consistency
        await fetchUsers(true);
        throw new Error(err?.response?.data?.message || 'Failed to update user');
      }
    },
    [fetchUsers]
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      try {
        await apiClient.delete(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
        
        // Remove from local state
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } catch (err: any) {
        throw new Error(err?.response?.data?.message || 'Failed to delete user');
      }
    },
    []
  );

  /**
   * Approve a user
   */
  const approveUser = useCallback(
    async (id: string): Promise<AdminUserDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminUserResponse>(
          API_ENDPOINTS.ADMIN_USER_APPROVE(id)
        );
        const approved = mapRemoteUserToDTO(response.data);
        
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? approved : u))
        );
        
        return approved;
      } catch (err: any) {
        await fetchUsers(true);
        throw new Error(err?.response?.data?.message || 'Failed to approve user');
      }
    },
    [fetchUsers]
  );

  /**
   * Reject a user
   */
  const rejectUser = useCallback(
    async (id: string, reason?: string): Promise<AdminUserDTO> => {
      try {
        const response = await apiClient.post<RemoteAdminUserResponse>(
          API_ENDPOINTS.ADMIN_USER_REJECT(id),
          { reason }
        );
        const rejected = mapRemoteUserToDTO(response.data);
        
        // Update local state
        setUsers((prev) =>
          prev.map((u) => (u.id === id ? rejected : u))
        );
        
        return rejected;
      } catch (err: any) {
        await fetchUsers(true);
        throw new Error(err?.response?.data?.message || 'Failed to reject user');
      }
    },
    [fetchUsers]
  );

  useEffect(() => {
    if (!authLoading) {
      fetchUsers();
    }
  }, [authLoading, fetchUsers]);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    approveUser,
    rejectUser,
  };
}

