'use client';

import { useEffect, useState } from 'react';
import { ListTestimonialsUseCase, TestimonialDTO, TestimonialFilterOptions } from '@/core/application/testimonials';
import { testimonialRepository } from '@/infrastructure/persistence/testimonials';

interface UseTestimonialsResult {
  testimonials: TestimonialDTO[];
  loading: boolean;
  error: Error | null;
}

export function useTestimonials(options?: TestimonialFilterOptions): UseTestimonialsResult {
  const [testimonials, setTestimonials] = useState<TestimonialDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const useCase = new ListTestimonialsUseCase(testimonialRepository);

    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await useCase.execute(options);
        if (!controller.signal.aborted) {
          setTestimonials(result);
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err instanceof Error ? err : new Error('Failed to load testimonials'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTestimonials();

    return () => controller.abort();
  }, [
    options?.featured,
    options?.limit,
    options?.locale,
    options?.sourceTypes?.join(','),
  ]);

  return { testimonials, loading, error };
}


