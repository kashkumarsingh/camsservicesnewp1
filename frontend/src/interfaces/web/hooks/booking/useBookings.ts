'use client';

import { useState, useEffect } from 'react';
import { ListBookingsUseCase } from '@/core/application/booking/useCases/ListBookingsUseCase';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { BookingFilterOptions } from '@/core/application/booking/dto/BookingFilterOptions';
import { bookingRepository } from '@/infrastructure/persistence/booking';

/**
 * useBookings Hook
 * Provides a composable way to interact with booking list use cases
 */
export function useBookings(filterOptions?: BookingFilterOptions) {
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const listBookingsUseCase = new ListBookingsUseCase(bookingRepository);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listBookingsUseCase.execute(filterOptions);
        setBookings(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filterOptions]);

  return {
    bookings,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listBookingsUseCase.execute(filterOptions);
        setBookings(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    },
  };
}


