/**
 * usePackages Hook
 * 
 * Hook for listing packages.
 */

'use client';

import { useState, useEffect } from 'react';
import { ListPackagesUseCase } from '@/core/application/packages/useCases/ListPackagesUseCase';
import { PackageDTO, PackageFilterOptions } from '@/core/application/packages';
import { packageRepository } from '@/infrastructure/persistence/packages';

export function usePackages(options?: PackageFilterOptions) {
  const [packages, setPackages] = useState<PackageDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPackages = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const useCase = new ListPackagesUseCase(packageRepository);
        const result = await useCase.execute(options);
        
        setPackages(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load packages'));
      } finally {
        setLoading(false);
      }
    };

    loadPackages();
  }, [
    options?.search, 
    options?.priceRange?.min, 
    options?.priceRange?.max,
    options?.hoursRange?.min,
    options?.hoursRange?.max,
    options?.available,
    options?.popular,
    options?.sortBy, 
    options?.sortOrder
  ]);

  return { packages, loading, error };
}


