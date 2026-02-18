'use client';

import { useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { SafeguardingConcernFormData } from '@/components/dashboard/modals/SafeguardingConcernModal';

function buildPayload(data: SafeguardingConcernFormData): Record<string, string | number> {
  const payload: Record<string, string | number> = {
    concernType: data.concernType,
    description: data.description,
  };
  if (data.childId != null && data.childId > 0) {
    payload.childId = data.childId;
  }
  const dateVal = data.dateOfConcern?.trim();
  if (dateVal) payload.dateOfConcern = dateVal;
  const contactVal = data.contactPreference?.trim();
  if (contactVal) payload.contactPreference = contactVal;
  return payload;
}

export function useSubmitSafeguardingConcern() {
  const submitSafeguardingConcern = useCallback(async (data: SafeguardingConcernFormData): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.DASHBOARD_SAFEGUARDING_CONCERNS, buildPayload(data));
  }, []);

  return { submitSafeguardingConcern };
}
