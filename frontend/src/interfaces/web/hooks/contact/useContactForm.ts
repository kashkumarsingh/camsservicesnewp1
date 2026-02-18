/**
 * useContactForm Hook
 * 
 * Hook for submitting contact forms.
 */

'use client';

import { useState, useCallback } from 'react';
import { SubmitContactFormUseCase } from '@/core/application/contact/useCases/SubmitContactFormUseCase';
import { ContactSubmissionFactory } from '@/core/application/contact/factories/ContactSubmissionFactory';
import { CreateContactSubmissionDTO, ContactSubmissionDTO } from '@/core/application/contact';
import { contactRepository } from '@/infrastructure/persistence/contact';
import { UuidIdGenerator } from '@/infrastructure/generators/UuidIdGenerator';

export function useContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState(false);
  const [submission, setSubmission] = useState<ContactSubmissionDTO | null>(null);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);

  const submit = useCallback(async (data: CreateContactSubmissionDTO) => {
    // Client-side debouncing: prevent rapid successive submissions
    const now = Date.now();
    const timeSinceLastSubmit = now - lastSubmitTime;
    const DEBOUNCE_MS = 2000; // 2 seconds minimum between submissions

    if (timeSinceLastSubmit < DEBOUNCE_MS) {
      const remainingTime = Math.ceil((DEBOUNCE_MS - timeSinceLastSubmit) / 1000);
      const debounceError = new Error(`Please wait ${remainingTime} second${remainingTime > 1 ? 's' : ''} before submitting again.`);
      setError(debounceError);
      throw debounceError;
    }

    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      setSuccess(false);
      setLastSubmitTime(now);

      const idGenerator = new UuidIdGenerator();
      const factory = new ContactSubmissionFactory(idGenerator);
      const useCase = new SubmitContactFormUseCase(contactRepository, factory);

      const result = await useCase.execute(data);
      
      // Success - clear error state and set success
      setSubmission(result);
      setError(null); // Explicitly clear error on success
      setSuccess(true);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to submit contact form');
      
      // Preserve original error message if available
      if (err instanceof Error && err.message) {
        error.message = err.message;
      }
      
      setError(error);
      setSuccess(false);
      throw error; // Re-throw so caller can handle it
    } finally {
      setLoading(false);
    }
  }, [lastSubmitTime]);

  return { submit, loading, error, success, submission };
}


