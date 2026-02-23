/**
 * useServices Hook
 *
 * Hook for listing services. Set enabled: false to skip the fetch (e.g. on login/register).
 */

'use client';

import { useState, useEffect } from 'react';
import { ListServicesUseCase } from '@/core/application/services/useCases/ListServicesUseCase';
import { ServiceDTO, ServiceFilterOptions } from '@/core/application/services';
import { serviceRepository } from '@/infrastructure/persistence/services';

export type UseServicesOptions = ServiceFilterOptions & {
  /** When false, no API call is made. Default true. */
  enabled?: boolean;
};

export function useServices(options?: UseServicesOptions) {
  const enabled = options?.enabled !== false;
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);

        const { enabled: _enabled, ...filterOptions } = options ?? {};
        const useCase = new ListServicesUseCase(serviceRepository);
        const result = await useCase.execute(filterOptions);

        setServices(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load services'));
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [
    enabled,
    options?.search,
    options?.category,
    options?.sortBy,
    options?.sortOrder,
    options?.limit,
  ]);

  return { services, loading, error };
}


