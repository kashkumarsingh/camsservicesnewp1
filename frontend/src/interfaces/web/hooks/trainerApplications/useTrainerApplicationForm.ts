/**
 * useTrainerApplicationForm
 *
 * Client hook to submit trainer onboarding applications.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  CreateTrainerApplicationDTO,
  TrainerApplicationDTO,
  TrainerApplicationFactory,
  SubmitTrainerApplicationUseCase,
} from '@/core/application/trainerApplications';
import { trainerApplicationRepository } from '@/infrastructure/persistence/trainerApplications';
import { UuidIdGenerator } from '@/infrastructure/generators/UuidIdGenerator';

export function useTrainerApplicationForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<TrainerApplicationDTO | null>(null);

  const submit = useCallback(async (data: CreateTrainerApplicationDTO) => {
    setLoading(true);
    setError(null);
    try {
      const factory = new TrainerApplicationFactory(new UuidIdGenerator());
      const useCase = new SubmitTrainerApplicationUseCase(trainerApplicationRepository, factory);
      const response = await useCase.execute(data);
      setResult(response);
      return response;
    } catch (err) {
      const finalError = err instanceof Error ? err : new Error('Failed to submit trainer application');
      setError(finalError);
      throw finalError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error, result };
}


