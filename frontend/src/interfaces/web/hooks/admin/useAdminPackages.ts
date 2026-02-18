/**
 * useAdminPackages Hook (Interface Layer)
 *
 * Clean Architecture Layer: Interface (Web Hook)
 * Purpose: Provides CRUD operations for admin packages management
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminPackages.ts
 *
 * Features:
 * - List all packages with filtering (ageGroup, difficultyLevel, isActive, isPopular, search)
 * - Create new package
 * - Update existing package
 * - Delete package
 * - Get single package by ID
 */

import { useState, useEffect, useCallback } from 'react';
import type { AdminPackageDTO, CreatePackageDTO, UpdatePackageDTO } from '@/core/application/admin/dto/AdminPackageDTO';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';

interface UseAdminPackagesOptions {
  ageGroup?: string;
  difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  isActive?: boolean;
  isPopular?: boolean;
  search?: string;
}

interface UseAdminPackagesReturn {
  packages: AdminPackageDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPackage: (data: CreatePackageDTO) => Promise<AdminPackageDTO>;
  updatePackage: (id: string, data: UpdatePackageDTO) => Promise<AdminPackageDTO>;
  deletePackage: (id: string) => Promise<void>;
  getPackageById: (id: string) => Promise<AdminPackageDTO>;
}

export function useAdminPackages(options: UseAdminPackagesOptions = {}): UseAdminPackagesReturn {
  const [packages, setPackages] = useState<AdminPackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPackages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.ageGroup) {
        params.append('ageGroup', options.ageGroup);
      }
      if (options.difficultyLevel) {
        params.append('difficultyLevel', options.difficultyLevel);
      }
      if (options.isActive !== undefined) {
        params.append('isActive', String(options.isActive));
      }
      if (options.isPopular !== undefined) {
        params.append('isPopular', String(options.isPopular));
      }
      if (options.search) {
        params.append('search', options.search);
      }

      const url = params.toString()
        ? `${API_ENDPOINTS.ADMIN_PACKAGES}?${params.toString()}`
        : API_ENDPOINTS.ADMIN_PACKAGES;

      /**
       * The ApiClient unwraps Laravel-style responses:
       * - Single resources: { data: T }
       * - Collections with metadata: { data: { data: T[]; meta: Meta } }
       *
       * Admin packages use the collection form, so we normalise back to
       * a simple array for this hook.
       */
      type AdminPackagesCollectionPayload = {
        data: AdminPackageDTO[];
        meta?: Record<string, unknown>;
      };

      const response = await apiClient.get<
        AdminPackageDTO[] | AdminPackagesCollectionPayload
      >(url);

      let nextPackages: AdminPackageDTO[] = [];
      if (Array.isArray(response.data)) {
        nextPackages = response.data;
      } else if (response.data && 'data' in response.data) {
        const payload = response.data as AdminPackagesCollectionPayload;
        nextPackages = Array.isArray(payload.data) ? payload.data : [];
      }

      setPackages(nextPackages);
    } catch (err: any) {
      setError(err?.message || 'Failed to load packages');
      setPackages([]);
    } finally {
      setLoading(false);
    }
  }, [options.ageGroup, options.difficultyLevel, options.isActive, options.isPopular, options.search]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const createPackage = useCallback(async (data: CreatePackageDTO): Promise<AdminPackageDTO> => {
    try {
      const response = await apiClient.post<AdminPackageDTO>(API_ENDPOINTS.ADMIN_PACKAGES, data);
      
      if (!response.data) {
        throw new Error('Failed to create package');
      }

      // Refetch to update list
      await fetchPackages();
      
      return response.data;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to create package');
    }
  }, [fetchPackages]);

  const updatePackage = useCallback(async (id: string, data: UpdatePackageDTO): Promise<AdminPackageDTO> => {
    try {
      const response = await apiClient.put<AdminPackageDTO>(
        API_ENDPOINTS.ADMIN_PACKAGE_BY_ID(id),
        data
      );
      
      if (!response.data) {
        throw new Error('Failed to update package');
      }

      // Refetch to update list
      await fetchPackages();
      
      return response.data;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to update package');
    }
  }, [fetchPackages]);

  const deletePackage = useCallback(async (id: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN_PACKAGE_BY_ID(id));
      
      // Refetch to update list
      await fetchPackages();
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to delete package');
    }
  }, [fetchPackages]);

  const getPackageById = useCallback(async (id: string): Promise<AdminPackageDTO> => {
    try {
      const response = await apiClient.get<AdminPackageDTO>(API_ENDPOINTS.ADMIN_PACKAGE_BY_ID(id));

      if (!response.data) {
        throw new Error('Package not found');
      }

      return response.data;
    } catch (err: any) {
      throw new Error(err?.message || 'Failed to load package');
    }
  }, []);

  return {
    packages,
    loading,
    error,
    refetch: fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    getPackageById,
  };
}
