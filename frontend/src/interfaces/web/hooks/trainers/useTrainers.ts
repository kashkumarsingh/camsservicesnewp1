/**
 * useTrainers Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { ListTrainersUseCase } from '@/core/application/trainers/useCases/ListTrainersUseCase';
import { TrainerDTO, TrainerFilterOptions } from '@/core/application/trainers';
import { trainerRepository } from '@/infrastructure/persistence/trainers';

export function useTrainers(options?: TrainerFilterOptions) {
  const [trainers, setTrainers] = useState<TrainerDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTrainers = async () => {
      try {
        setLoading(true);
        setError(null);

        const useCase = new ListTrainersUseCase(trainerRepository);
        const result = await useCase.execute(options);

        setTrainers(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load trainers'));
      } finally {
        setLoading(false);
      }
    };

    loadTrainers();
  }, [
    options?.search,
    options?.capability,
    options?.specialty,
    options?.minimumRating,
    options?.available,
    options?.sortBy,
    options?.sortOrder
  ]);

  return { trainers, loading, error };
}

