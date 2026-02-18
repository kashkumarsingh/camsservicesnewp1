'use client';

import { useState } from 'react';
import { CreateBookingUseCase } from '@/core/application/booking/useCases/CreateBookingUseCase';
import { CreateBookingDTO } from '@/core/application/booking/dto/CreateBookingDTO';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { bookingRepository, mockNotificationService } from '@/infrastructure/persistence/booking';

/**
 * useCreateBooking Hook
 * Provides a composable way to create bookings
 */
export function useCreateBooking() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDTO | null>(null);

  const createBookingUseCase = new CreateBookingUseCase(
    bookingRepository,
    mockNotificationService
  );

  const createBooking = async (
    dto: CreateBookingDTO,
    packageBasePrice: number,
    hourlyRate?: number,
    minAge?: number,
    maxAge?: number
  ): Promise<BookingDTO | null> => {
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useCreateBooking] Calling use case with:', { dto, packageBasePrice });
      }
      const result = await createBookingUseCase.execute(
        dto,
        packageBasePrice,
        hourlyRate,
        minAge,
        maxAge
      );
      if (process.env.NODE_ENV === 'development') {
        console.log('[useCreateBooking] Use case returned:', result);
      }
      setBooking(result);
      return result;
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[useCreateBooking] Error caught:', err);
      }
      // Extract error message from API response
      let errorMessage = 'Failed to create booking';
      
      if (err?.response?.data) {
        const data = err.response.data;
        
        // Handle validation errors (422)
        if (data.errors && typeof data.errors === 'object') {
          const validationErrors: string[] = [];
          Object.entries(data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              validationErrors.push(...messages);
            } else if (typeof messages === 'string') {
              validationErrors.push(messages);
            }
          });
          
          if (validationErrors.length > 0) {
            errorMessage = validationErrors.join('. ');
          } else if (data.message) {
            errorMessage = data.message;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBooking,
    loading,
    error,
    booking,
    reset: () => {
      setError(null);
      setBooking(null);
    },
  };
}


