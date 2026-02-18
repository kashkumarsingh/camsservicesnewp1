'use client';

import { useState, useEffect } from 'react';
import { GetBookingUseCase } from '@/core/application/booking/useCases/GetBookingUseCase';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { bookingRepository } from '@/infrastructure/persistence/booking';

/**
 * useBooking Hook
 * Provides a composable way to interact with single booking use cases
 */
export function useBooking(id?: string, reference?: string) {
  const [booking, setBooking] = useState<BookingDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getBookingUseCase = new GetBookingUseCase(bookingRepository);

  useEffect(() => {
    if (!id && !reference) {
      return;
    }

    const fetchBooking = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = id
          ? await getBookingUseCase.execute(id)
          : await getBookingUseCase.executeByReference(reference!);
        setBooking(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking');
        setBooking(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, reference]);

  return {
    booking,
    loading,
    error,
    refetch: async () => {
      if (!id && !reference) return;
      setLoading(true);
      setError(null);
      try {
        const result = id
          ? await getBookingUseCase.execute(id)
          : await getBookingUseCase.executeByReference(reference!);
        setBooking(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch booking');
      } finally {
        setLoading(false);
      }
    },
  };
}


