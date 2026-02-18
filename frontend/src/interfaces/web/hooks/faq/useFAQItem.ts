/**
 * useFAQItem Hook
 * 
 * Hook for fetching a single FAQ item.
 */

'use client';

import { useState, useEffect } from 'react';
import { GetFAQItemUseCase } from '@/core/application/faq/useCases/GetFAQItemUseCase';
import { IncrementViewsUseCase } from '@/core/application/faq/useCases/IncrementViewsUseCase';
import { FAQItemDTO } from '@/core/application/faq';
import { faqRepository } from '@/infrastructure/persistence/faq';

export function useFAQItem(idOrSlug: string, incrementViews: boolean = false) {
  const [faq, setFaq] = useState<FAQItemDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadFAQ = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const getUseCase = new GetFAQItemUseCase(faqRepository);
        const result = await getUseCase.execute(idOrSlug);
        
        if (!result) {
          setError(new Error('FAQ not found'));
          return;
        }

        setFaq(result);

        // Increment views if requested
        if (incrementViews) {
          const incrementUseCase = new IncrementViewsUseCase(faqRepository);
          await incrementUseCase.execute(idOrSlug);
          // Reload to get updated view count
          const updated = await getUseCase.execute(idOrSlug);
          if (updated) {
            setFaq(updated);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load FAQ'));
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      loadFAQ();
    }
  }, [idOrSlug, incrementViews]);

  return { faq, loading, error };
}

