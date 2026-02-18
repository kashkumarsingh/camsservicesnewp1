/**
 * useAdminTrainers Hook (Interface Layer)
 *
 * Clean Architecture: Interface Layer (React Hook)
 * Purpose: Provides admin trainers management functionality
 * Location: frontend/src/interfaces/web/hooks/admin/useAdminTrainers.ts
 *
 * This hook encapsulates:
 * - Fetching trainers with advanced filters
 * - CRUD operations (Create, Read, Update, Delete)
 * - Activate/deactivate trainers
 * - Export to CSV
 * - Optimistic UI updates
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type {
  AdminTrainerDTO,
  RemoteTrainersListResponse,
  RemoteTrainerResponse,
  CreateTrainerDTO,
  UpdateTrainerDTO,
  ActivateTrainerDTO,
  AdminTrainersFilters,
} from '@/core/application/admin/dto/AdminTrainerDTO';
import { mapRemoteTrainerToAdminTrainerDTO } from '@/core/application/admin/dto/AdminTrainerDTO';
import type {
  TrainerCertification,
  UploadQualificationRequest,
} from '@/core/application/trainer/types';

export function useAdminTrainers(initialFilters?: AdminTrainersFilters) {
  const [trainers, setTrainers] = useState<AdminTrainerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<AdminTrainersFilters>(
    initialFilters || {}
  );

  /**
   * Fetch trainers from backend with filters
   */
  const fetchTrainers = useCallback(async (
    customFilters?: AdminTrainersFilters
  ) => {
    try {
      setLoading(true);
      setError(null);

      const activeFilters = customFilters || filters;

      // Build query string
      const params = new URLSearchParams();
      if (activeFilters.is_active !== undefined)
        params.append('is_active', String(activeFilters.is_active));
      if (activeFilters.has_certifications !== undefined)
        params.append(
          'has_certifications',
          String(activeFilters.has_certifications)
        );
      if (activeFilters.service_region)
        params.append('service_region', activeFilters.service_region);
      if (activeFilters.search) params.append('search', activeFilters.search);
      if (activeFilters.limit)
        params.append('limit', String(activeFilters.limit));
      if (activeFilters.offset)
        params.append('offset', String(activeFilters.offset));

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.ADMIN_TRAINERS}?${queryString}`
        : API_ENDPOINTS.ADMIN_TRAINERS;

      const response = await apiClient.get<RemoteTrainersListResponse>(url);

      if (!response.data?.data) {
        throw new Error('Invalid response format from backend API');
      }

      const mapped = response.data.data.map((t) =>
        mapRemoteTrainerToAdminTrainerDTO(t)
      );
      setTrainers(mapped);
      setTotalCount(response.data.meta?.total_count || mapped.length);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load trainers';
      setError(message);
      console.error('[useAdminTrainers] fetchTrainers error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Create a new trainer
   */
  const createTrainer = useCallback(async (
    data: CreateTrainerDTO
  ): Promise<AdminTrainerDTO> => {
    try {
      const response = await apiClient.post<RemoteTrainerResponse>(
        API_ENDPOINTS.ADMIN_TRAINERS,
        data
      );

      if (!response.data) {
        throw new Error('Failed to create trainer');
      }

      // Refetch to get updated list
      await fetchTrainers();

      return mapRemoteTrainerToAdminTrainerDTO(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create trainer';
      setError(message);
      console.error('[useAdminTrainers] createTrainer error:', err);
      throw err;
    }
  }, [fetchTrainers]);

  /**
   * Update an existing trainer
   */
  const updateTrainer = useCallback(async (
    trainerId: string,
    data: UpdateTrainerDTO
  ): Promise<void> => {
    try {
      // Optimistic update
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? {
                ...t,
                name: data.name ?? t.name,
                role: data.role ?? t.role,
                bio: data.bio ?? t.bio,
                fullDescription: data.full_description ?? t.fullDescription,
                image: data.image ?? t.image,
                specialties: data.specialties ?? t.specialties,
                certifications:
                  (data.certifications as TrainerCertification[]) ??
                  t.certifications,
                experienceYears: data.experience_years ?? t.experienceYears,
                homePostcode: data.home_postcode ?? t.homePostcode,
                travelRadiusKm: data.travel_radius_km ?? t.travelRadiusKm,
                serviceAreaPostcodes:
                  data.service_area_postcodes ?? t.serviceAreaPostcodes,
                preferredAgeGroups:
                  data.preferred_age_groups ?? t.preferredAgeGroups,
                isActive: data.is_active ?? t.isActive,
                isFeatured: data.is_featured ?? t.isFeatured,
                updatedAt: new Date().toISOString(),
              }
            : t
        )
      );

      await apiClient.put(
        `${API_ENDPOINTS.ADMIN_TRAINERS}/${trainerId}`,
        data
      );

      // Refetch to get latest data
      await fetchTrainers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update trainer';
      setError(message);
      console.error('[useAdminTrainers] updateTrainer error:', err);
      // Revert optimistic update on error
      await fetchTrainers();
      throw err;
    }
  }, [fetchTrainers]);

  /**
   * Delete a trainer
   */
  const deleteTrainer = useCallback(async (
    trainerId: string
  ): Promise<void> => {
    try {
      // Optimistic update
      setTrainers((prev) => prev.filter((t) => t.id !== trainerId));

      await apiClient.delete(`${API_ENDPOINTS.ADMIN_TRAINERS}/${trainerId}`);

      // Refetch to get updated count
      await fetchTrainers();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete trainer';
      setError(message);
      console.error('[useAdminTrainers] deleteTrainer error:', err);
      // Revert optimistic update on error
      await fetchTrainers();
      throw err;
    }
  }, [fetchTrainers]);

  /**
   * Activate or deactivate a trainer
   */
  const activateTrainer = useCallback(async (
    trainerId: string,
    data: ActivateTrainerDTO
  ): Promise<void> => {
    try {
      // Optimistic update
      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? { ...t, isActive: data.is_active }
            : t
        )
      );

      await apiClient.put(
        `${API_ENDPOINTS.ADMIN_TRAINERS}/${trainerId}/activate`,
        data
      );

      // Refetch to get latest data
      await fetchTrainers();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to activate/deactivate trainer';
      setError(message);
      console.error('[useAdminTrainers] activateTrainer error:', err);
      // Revert optimistic update on error
      await fetchTrainers();
      throw err;
    }
  }, [fetchTrainers]);

  /**
   * Get single trainer by ID
   */
  const getTrainer = useCallback(async (
    trainerId: string
  ): Promise<AdminTrainerDTO> => {
    try {
      const response = await apiClient.get<RemoteTrainerResponse>(
        `${API_ENDPOINTS.ADMIN_TRAINERS}/${trainerId}`
      );

      if (!response.data) {
        throw new Error('Trainer not found');
      }

      return mapRemoteTrainerToAdminTrainerDTO(response.data);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to load trainer';
      setError(message);
      console.error('[useAdminTrainers] getTrainer error:', err);
      throw err;
    }
  }, []);

  /**
   * Export trainers to CSV
   */
  const exportTrainers = useCallback(async (
    customFilters?: AdminTrainersFilters
  ): Promise<void> => {
    try {
      const activeFilters = customFilters || filters;

      // Build query string (same as fetchTrainers)
      const params = new URLSearchParams();
      if (activeFilters.is_active !== undefined)
        params.append('is_active', String(activeFilters.is_active));
      if (activeFilters.has_certifications !== undefined)
        params.append(
          'has_certifications',
          String(activeFilters.has_certifications)
        );
      if (activeFilters.service_region)
        params.append('service_region', activeFilters.service_region);
      if (activeFilters.search) params.append('search', activeFilters.search);

      const queryString = params.toString();
      const url = queryString
        ? `${API_ENDPOINTS.ADMIN_TRAINERS}/export?${queryString}`
        : `${API_ENDPOINTS.ADMIN_TRAINERS}/export`;

      // Fetch CSV as blob
      const response = await fetch(url, {
        headers: {
          Accept: 'text/csv',
        },
        credentials: 'include', // Include cookies for Sanctum auth
      });

      if (!response.ok) {
        throw new Error('Failed to export trainers');
      }

      // Download CSV file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `trainers-export-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to export trainers';
      setError(message);
      console.error('[useAdminTrainers] exportTrainers error:', err);
      throw err;
    }
  }, [filters]);

  /**
   * Update filters and refetch
   */
  const updateFilters = useCallback((newFilters: AdminTrainersFilters) => {
    setFilters(newFilters);
    fetchTrainers(newFilters);
  }, [fetchTrainers]);

  /**
   * Upload trainer profile image (admin-managed)
   */
  const uploadTrainerImage = useCallback(
    async (
      trainerId: string,
      file: File
    ): Promise<{ image: string; image_path: string }> => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await apiClient.post<{
        image: string;
        image_path: string;
      }>(API_ENDPOINTS.ADMIN_TRAINER_IMAGE(trainerId), formData);

      const { image, image_path } = response.data;

      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? {
                ...t,
                image,
              }
            : t
        )
      );

      return { image, image_path };
    },
    []
  );

  /**
   * Upload trainer qualification/certification (admin-managed)
   */
  const uploadTrainerQualification = useCallback(
    async (
      trainerId: string,
      payload: UploadQualificationRequest
    ): Promise<TrainerCertification[]> => {
      const formData = new FormData();
      formData.append('file', payload.file);
      formData.append('name', payload.name);
      if (payload.year) {
        formData.append('year', payload.year.toString());
      }
      if (payload.issuer) {
        formData.append('issuer', payload.issuer);
      }

      const response = await apiClient.post<{
        certification: TrainerCertification;
        certifications: TrainerCertification[];
      }>(API_ENDPOINTS.ADMIN_TRAINER_QUALIFICATIONS(trainerId), formData);

      const certifications = response.data.certifications || [];

      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? {
                ...t,
                certifications,
              }
            : t
        )
      );

      return certifications;
    },
    []
  );

  /**
   * Delete trainer qualification/certification (admin-managed)
   */
  const deleteTrainerQualification = useCallback(
    async (
      trainerId: string,
      certificationId: string
    ): Promise<TrainerCertification[]> => {
      const response = await apiClient.delete<{
        certifications: TrainerCertification[];
      }>(
        API_ENDPOINTS.ADMIN_TRAINER_QUALIFICATION_DELETE(
          trainerId,
          certificationId
        )
      );

      const certifications = response.data.certifications || [];

      setTrainers((prev) =>
        prev.map((t) =>
          t.id === trainerId
            ? {
                ...t,
                certifications,
              }
            : t
        )
      );

      return certifications;
    },
    []
  );

  // Initial fetch
  useEffect(() => {
    fetchTrainers();
  }, []);

  return {
    trainers,
    loading,
    error,
    totalCount,
    filters,
    fetchTrainers,
    createTrainer,
    updateTrainer,
    deleteTrainer,
    activateTrainer,
    getTrainer,
    exportTrainers,
    updateFilters,
    uploadTrainerImage,
    uploadTrainerQualification,
    deleteTrainerQualification,
  };
}
