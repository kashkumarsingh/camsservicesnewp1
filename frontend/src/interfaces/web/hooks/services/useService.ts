/**
 * useService Hook
 * 
 * Hook for fetching a single service.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetServiceUseCase } from '@/core/application/services/useCases/GetServiceUseCase';
import { IncrementViewsUseCase } from '@/core/application/services/useCases/IncrementViewsUseCase';
import { ServiceDTO } from '@/core/application/services';
import { serviceRepository } from '@/infrastructure/persistence/services';

export function useService(idOrSlug: string, incrementViews: boolean = false) {
  const [service, setService] = useState<ServiceDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetServiceUseCase(serviceRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('Service not found'));
          return;
        }

        setService(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(serviceRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setService(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load service'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadService();
    }
  }, [idOrSlug, incrementViews]);

  return { service, loading, error };
}


