/**
 * useFAQ Hook
 * 
 * Main FAQ hook for listing and searching FAQ items.
 */

'use client';

import { useState, useEffect } from 'react';
import { ListFAQItemsUseCase } from '@/core/application/faq/useCases/ListFAQItemsUseCase';
import { FAQItemDTO, FAQFilterOptions } from '@/core/application/faq';
import { faqRepository } from '@/infrastructure/persistence/faq';

export function useFAQ(options?: FAQFilterOptions) {
  const [faqs, setFaqs] = useState<FAQItemDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFAQs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const useCase = new ListFAQItemsUseCase(faqRepository);
        const result = await useCase.execute(options);
        
        setFaqs(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load FAQs'));
      } finally {
        setLoading(false);
      }
    };

    loadFAQs();
  }, [options?.search, options?.category, options?.sortBy, options?.sortOrder]);

  return { faqs, loading, error };
}

