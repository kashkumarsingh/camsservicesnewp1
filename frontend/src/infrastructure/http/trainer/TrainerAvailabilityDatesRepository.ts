/**
 * Trainer availability by calendar dates (single/multi select).
 * Uses shared contract from core/application/trainer/dto/TrainerAvailabilityDatesDTO.
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import {
  type TrainerAvailabilityDatesPayload,
  type TrainerAvailabilityDatesResult,
  parseAvailabilityDatesPayload,
} from '@/core/application/trainer/dto/TrainerAvailabilityDatesDTO';

export type { TrainerAvailabilityDatesResult } from '@/core/application/trainer/dto/TrainerAvailabilityDatesDTO';

function unwrapPayload(
  raw: { data?: TrainerAvailabilityDatesPayload } | TrainerAvailabilityDatesPayload | undefined
): TrainerAvailabilityDatesPayload | undefined {
  if (raw == null) return undefined;
  if (typeof raw === 'object' && 'data' in raw && raw.data != null) return raw.data;
  return raw as TrainerAvailabilityDatesPayload;
}

export class TrainerAvailabilityDatesRepository {
  /**
   * Get dates when the trainer is available and unavailable in the given range (YYYY-MM-DD).
   */
  async getDates(dateFrom: string, dateTo: string): Promise<TrainerAvailabilityDatesResult> {
    const response = await apiClient.get<{ data?: TrainerAvailabilityDatesPayload } | TrainerAvailabilityDatesPayload>(
      API_ENDPOINTS.TRAINER_AVAILABILITY_DATES,
      { params: { date_from: dateFrom, date_to: dateTo } }
    );
    const payload = unwrapPayload(response.data);
    return parseAvailabilityDatesPayload(payload);
  }

  /**
   * Set availability and unavailable for the given range. Replaces existing specific-date
   * records in that range with the provided dates.
   */
  async setDates(
    dateFrom: string,
    dateTo: string,
    dates: string[],
    unavailableDates: string[] = []
  ): Promise<TrainerAvailabilityDatesResult> {
    const response = await apiClient.put<{ data?: TrainerAvailabilityDatesPayload } | TrainerAvailabilityDatesPayload>(
      API_ENDPOINTS.TRAINER_AVAILABILITY_DATES,
      { date_from: dateFrom, date_to: dateTo, dates, unavailable_dates: unavailableDates }
    );
    const payload = unwrapPayload(response.data);
    return parseAvailabilityDatesPayload(payload);
  }
}

export const trainerAvailabilityDatesRepository = new TrainerAvailabilityDatesRepository();
