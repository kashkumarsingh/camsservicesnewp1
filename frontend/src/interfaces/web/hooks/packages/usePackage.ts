/**
 * usePackage Hook
 * 
 * Hook for fetching a single package.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetPackageUseCase } from '@/core/application/packages/useCases/GetPackageUseCase';
import { IncrementViewsUseCase } from '@/core/application/packages/useCases/IncrementViewsUseCase';
import { PackageDTO } from '@/core/application/packages';
import { packageRepository } from '@/infrastructure/persistence/packages';

export function usePackage(idOrSlug: string, incrementViews: boolean = false) {
  const [package_, setPackage] = useState<PackageDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPackage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetPackageUseCase(packageRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('Package not found'));
          return;
        }

        setPackage(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(packageRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setPackage(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load package'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadPackage();
    }
  }, [idOrSlug, incrementViews]);

  return { package: package_, loading, error };
}


