/**
 * usePolicy Hook
 * 
 * Hook for fetching a single policy.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetPolicyUseCase } from '@/core/application/policies/useCases/GetPolicyUseCase';
import { IncrementViewsUseCase } from '@/core/application/policies/useCases/IncrementViewsUseCase';
import { PolicyDTO } from '@/core/application/policies';
import { policyRepository } from '@/infrastructure/persistence/policies';

export function usePolicy(idOrSlug: string, incrementViews: boolean = false) {
  const [policy, setPolicy] = useState<PolicyDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetPolicyUseCase(policyRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('Policy not found'));
          return;
        }

        setPolicy(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(policyRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setPolicy(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load policy'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadPolicy();
    }
  }, [idOrSlug, incrementViews]);

  return { policy, loading, error };
}


