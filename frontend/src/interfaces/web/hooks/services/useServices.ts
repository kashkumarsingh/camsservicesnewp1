/**
 * useServices Hook
 * 
 * Hook for listing services.
 */

'use client';

import { useState, useEffect } from 'react';
import { ListServicesUseCase } from '@/core/application/services/useCases/ListServicesUseCase';
import { ServiceDTO, ServiceFilterOptions } from '@/core/application/services';
import { serviceRepository } from '@/infrastructure/persistence/services';

export function useServices(options?: ServiceFilterOptions) {
  const [services, setServices] = useState<ServiceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const useCase = new ListServicesUseCase(serviceRepository);
        const result = await useCase.execute(options);
        
        setServices(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load services'));
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, [options?.search, options?.category, options?.sortBy, options?.sortOrder]);

  return { services, loading, error };
}


