'use client';

import { useState } from 'react';
import { CancelBookingUseCase } from '@/core/application/booking/useCases/CancelBookingUseCase';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { bookingRepository, mockNotificationService } from '@/infrastructure/persistence/booking';

/**
 * useCancelBooking Hook
 * Provides a composable way to cancel a booking (e.g. Payment Pending / draft).
 */
export function useCancelBooking() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const cancelBookingUseCase = new CancelBookingUseCase(
    bookingRepository,
    mockNotificationService
  );

  const cancelBooking = async (
    id: string,
    reason: string
  ): Promise<BookingDTO | null> => {
    setLoading(true);
    setError(null);

    try {
      const cancelled = await cancelBookingUseCase.execute(id, reason);
      return cancelled;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to cancel booking';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    cancelBooking,
    loading,
    error,
    resetError: () => setError(null),
  };
}
