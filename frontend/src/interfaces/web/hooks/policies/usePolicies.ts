/**
 * usePolicies Hook
 * 
 * Hook for listing policies.
 */

'use client';

import { useState, useEffect } from 'react';
import { ListPoliciesUseCase } from '@/core/application/policies/useCases/ListPoliciesUseCase';
import { PolicyDTO, PolicyFilterOptions } from '@/core/application/policies';
import { policyRepository } from '@/infrastructure/persistence/policies';

export function usePolicies(options?: PolicyFilterOptions) {
  const [policies, setPolicies] = useState<PolicyDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPolicies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const useCase = new ListPoliciesUseCase(policyRepository);
        const result = await useCase.execute(options);
        
        setPolicies(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load policies'));
      } finally {
        setLoading(false);
      }
    };

    loadPolicies();
  }, [
    options?.type,
    options?.published,
    options?.effective,
    options?.sortBy,
    options?.sortOrder
  ]);

  return { policies, loading, error };
}


