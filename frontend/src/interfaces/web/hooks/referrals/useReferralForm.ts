'use client';

import { useCallback, useState } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

export interface CreateReferralSubmissionDTO {
  referrer_name: string;
  referrer_role: string;
  referrer_email: string;
  referrer_phone: string;
  young_person_name: string;
  young_person_age: string;
  school_setting?: string;
  primary_concern: string;
  background_context: string;
  success_outcome: string;
  preferred_package: string;
  additional_info?: string;
}

interface ReferralSubmissionResponse {
  id: string;
  status: string;
}

export function useReferralForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<ReferralSubmissionResponse | null>(null);

  const submit = useCallback(async (data: CreateReferralSubmissionDTO) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<ReferralSubmissionResponse>(API_ENDPOINTS.REFERRALS, data);
      setResult(response.data);
      return response.data;
    } catch (err) {
      const finalError = err instanceof Error ? err : new Error('Failed to submit referral');
      setError(finalError);
      throw finalError;
    } finally {
      setLoading(false);
    }
  }, []);

  return { submit, loading, error, result };
}

