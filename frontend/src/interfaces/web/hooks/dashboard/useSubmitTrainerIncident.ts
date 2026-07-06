'use client';

import { useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { IncidentReportFormData } from '@/components/dashboard/modals/IncidentReportModal';

function buildPayload(data: IncidentReportFormData): Record<string, string | number> {
  const payload: Record<string, string | number> = {
    incidentType: data.incidentType,
    severity: data.severity,
    description: data.description,
  };
  if (data.childId != null && data.childId > 0) {
    payload.childId = data.childId;
  }
  if (data.bookingScheduleId != null && data.bookingScheduleId > 0) {
    payload.bookingScheduleId = data.bookingScheduleId;
  }
  const locationVal = data.location?.trim();
  if (locationVal) payload.location = locationVal;
  const occurredVal = data.occurredAt?.trim();
  if (occurredVal) payload.occurredAt = occurredVal;
  const actionsVal = data.immediateActions?.trim();
  if (actionsVal) payload.immediateActions = actionsVal;
  return payload;
}

export function useSubmitTrainerIncident() {
  const submitTrainerIncident = useCallback(async (data: IncidentReportFormData): Promise<{ reference?: string }> => {
    const response = await apiClient.post<{ reference?: string }>(
      API_ENDPOINTS.TRAINER_INCIDENTS,
      buildPayload(data)
    );
    return response.data ?? {};
  }, []);

  return { submitTrainerIncident };
}
