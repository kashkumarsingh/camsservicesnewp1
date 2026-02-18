/**
 * useAdminServices Hook (Interface Layer)
 *
 * Clean Architecture Layer: Interface (Web Hook)
 * Purpose: Provides CRUD operations for admin services management
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminServices.ts
 *
 * Features:
 * - List all services with filtering (category, published, search)
 * - Create new service
 * - Update existing service
 * - Delete service
 * - Get single service by ID
 */

import { useState, useEffect, useCallback } from 'react';
import type { AdminServiceDTO, CreateServiceDTO, UpdateServiceDTO } from '@/core/application/admin/dto/AdminServiceDTO';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { getApiErrorMessage } from '@/utils/errorUtils';

interface UseAdminServicesOptions {
  category?: string;
  published?: boolean;
  search?: string;
}

interface UseAdminServicesReturn {
  services: AdminServiceDTO[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createService: (data: CreateServiceDTO) => Promise<AdminServiceDTO>;
  updateService: (id: string, data: UpdateServiceDTO) => Promise<AdminServiceDTO>;
  deleteService: (id: string) => Promise<void>;
  getServiceById: (id: string) => Promise<AdminServiceDTO>;
}

export function useAdminServices(options: UseAdminServicesOptions = {}): UseAdminServicesReturn {
  const [services, setServices] = useState<AdminServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.category) {
        params.append('category', options.category);
      }
      if (options.published !== undefined) {
        params.append('published', String(options.published));
      }
      if (options.search) {
        params.append('search', options.search);
      }

      const url = params.toString()
        ? `${API_ENDPOINTS.ADMIN_SERVICES}?${params.toString()}`
        : API_ENDPOINTS.ADMIN_SERVICES;

      // Normalise collection response: backend may return { success, data: [...], meta }
      const response = await apiClient.get<{ data?: AdminServiceDTO[] } | AdminServiceDTO[]>(url);
      const payload = response.data;

      const raw: AdminServiceDTO[] = Array.isArray(payload)
        ? payload
        : Array.isArray(
            payload && typeof payload === 'object' && 'data' in payload
              ? (payload as { data: AdminServiceDTO[] }).data
              : null
          )
          ? (payload as { data: AdminServiceDTO[] }).data
          : [];

      setServices(raw);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to load services'));
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [options.category, options.published, options.search]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const createService = useCallback(async (data: CreateServiceDTO): Promise<AdminServiceDTO> => {
    try {
      const response = await apiClient.post<AdminServiceDTO>(API_ENDPOINTS.ADMIN_SERVICES, data);
      
      if (!response.data) {
        throw new Error('Failed to create service');
      }

      // Refetch to update list
      await fetchServices();
      
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to create service'));
    }
  }, [fetchServices]);

  const updateService = useCallback(async (id: string, data: UpdateServiceDTO): Promise<AdminServiceDTO> => {
    try {
      const response = await apiClient.put<AdminServiceDTO>(
        API_ENDPOINTS.ADMIN_SERVICE_BY_ID(id),
        data
      );
      
      if (!response.data) {
        throw new Error('Failed to update service');
      }

      // Refetch to update list
      await fetchServices();
      
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to update service'));
    }
  }, [fetchServices]);

  const deleteService = useCallback(async (id: string): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.ADMIN_SERVICE_BY_ID(id));
      
      // Refetch to update list
      await fetchServices();
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to delete service'));
    }
  }, [fetchServices]);

  const getServiceById = useCallback(async (id: string): Promise<AdminServiceDTO> => {
    try {
      const response = await apiClient.get<AdminServiceDTO>(API_ENDPOINTS.ADMIN_SERVICE_BY_ID(id));
      
      if (!response.data) {
        throw new Error('Service not found');
      }
      
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, 'Failed to load service'));
    }
  }, []);

  return {
    services,
    loading,
    error,
    refetch: fetchServices,
    createService,
    updateService,
    deleteService,
    getServiceById,
  };
}
