'use client';

import { useState } from 'react';
import { ProcessPaymentUseCase } from '@/core/application/booking/useCases/ProcessPaymentUseCase';
import { ProcessPaymentDTO } from '@/core/application/booking/dto/ProcessPaymentDTO';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { bookingRepository, mockPaymentService } from '@/infrastructure/persistence/booking';

/**
 * useProcessPayment Hook
 * Provides a composable way to process payments
 */
export function useProcessPayment() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDTO | null>(null);

  const processPaymentUseCase = new ProcessPaymentUseCase(
    bookingRepository,
    mockPaymentService
  );

  const processPayment = async (paymentDTO: ProcessPaymentDTO): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setBooking(null);

    try {
      const result = await processPaymentUseCase.execute(paymentDTO);
      if (result.success) {
        setBooking(result.booking);
        return true;
      } else {
        setError(result.error || 'Payment processing failed');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process payment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    processPayment,
    loading,
    error,
    booking,
    reset: () => {
      setError(null);
      setBooking(null);
    },
  };
}


