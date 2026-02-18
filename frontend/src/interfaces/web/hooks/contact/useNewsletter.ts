/**
 * useNewsletter Hook
 * 
 * Hook for newsletter subscription/unsubscription.
 */

'use client';

import { useState } from 'react';
import { SubscribeNewsletterUseCase } from '@/core/application/contact/useCases/SubscribeNewsletterUseCase';
import { UnsubscribeNewsletterUseCase } from '@/core/application/contact/useCases/UnsubscribeNewsletterUseCase';
import { NewsletterSubscriptionFactory } from '@/core/application/contact/factories/NewsletterSubscriptionFactory';
import { CreateNewsletterSubscriptionDTO, NewsletterSubscriptionDTO } from '@/core/application/contact';
import { newsletterRepository } from '@/infrastructure/persistence/contact';
import { UuidIdGenerator } from '@/infrastructure/generators/UuidIdGenerator';

export function useNewsletter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [subscription, setSubscription] = useState<NewsletterSubscriptionDTO | null>(null);

  const subscribe = async (data: CreateNewsletterSubscriptionDTO) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const idGenerator = new UuidIdGenerator();
      const factory = new NewsletterSubscriptionFactory(idGenerator);
      const useCase = new SubscribeNewsletterUseCase(newsletterRepository, factory);

      const result = await useCase.execute(data);
      
      setSubscription(result);
      setSuccess(true);
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('Failed to subscribe to newsletter');
      setError(normalizedError);
      setSuccess(false);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const useCase = new UnsubscribeNewsletterUseCase(newsletterRepository);
      const result = await useCase.execute(email);
      
      if (result) {
        setSubscription(result);
        setSuccess(true);
      } else {
        setError(new Error('Subscription not found'));
      }
    } catch (err) {
      const normalizedError = err instanceof Error ? err : new Error('Failed to unsubscribe from newsletter');
      setError(normalizedError);
      setSuccess(false);
      throw normalizedError;
    } finally {
      setLoading(false);
    }
  };

  return { subscribe, unsubscribe, loading, error, success, subscription };
}


