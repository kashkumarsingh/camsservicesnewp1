/**
 * useTrainer Hook
 */

'use client';

import { useState, useEffect } from 'react';
import { GetTrainerUseCase } from '@/core/application/trainers/useCases/GetTrainerUseCase';
import { IncrementTrainerViewsUseCase } from '@/core/application/trainers/useCases/IncrementTrainerViewsUseCase';
import { TrainerDTO } from '@/core/application/trainers';
import { trainerRepository } from '@/infrastructure/persistence/trainers';

export function useTrainer(idOrSlug: string, incrementViews: boolean = false) {
  const [trainer, setTrainer] = useState<TrainerDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadTrainer = async () => {
      try {
        setLoading(true);
        setError(null);

        const getUseCase = new GetTrainerUseCase(trainerRepository);
        const result = await getUseCase.execute(idOrSlug);

        if (!result) {
          setError(new Error('Trainer not found'));
          return;
        }

        setTrainer(result);

        if (incrementViews) {
          const incrementUseCase = new IncrementTrainerViewsUseCase(trainerRepository);
          await incrementUseCase.execute(idOrSlug);
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setTrainer(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load trainer'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadTrainer();
    }
  }, [idOrSlug, incrementViews]);

  return { trainer, loading, error };
}
