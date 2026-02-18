/**
 * usePayments Hook
 * Provides a composable way to interact with payment list use cases
 * 
 * Clean Architecture: Interface Layer (React Hook)
 */

'use client';

import { useState, useEffect } from 'react';
import { ListPaymentsUseCase } from '@/core/application/payment/useCases/ListPaymentsUseCase';
import { PaymentDTO } from '@/core/application/payment/dto/PaymentDTO';
import { PaymentFilterOptions } from '@/core/application/payment/dto/PaymentFilterOptions';
import { paymentRepository } from '@/infrastructure/persistence/payment';

export function usePayments(filterOptions?: PaymentFilterOptions) {
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listPaymentsUseCase.execute(filterOptions);
        setPayments(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [filterOptions]);

  return {
    payments,
    loading,
    error,
    refetch: async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listPaymentsUseCase.execute(filterOptions);
        setPayments(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    },
  };
}

/**
 * usePaymentsForBooking Hook
 * Convenience hook to fetch payments for a specific booking
 */
export function usePaymentsForBooking(bookingId: string) {
  const listPaymentsUseCase = new ListPaymentsUseCase(paymentRepository);
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      return;
    }

    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await listPaymentsUseCase.executeForBooking(bookingId);
        setPayments(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [bookingId]);

  return {
    payments,
    loading,
    error,
    refetch: async () => {
      if (!bookingId) return;
      setLoading(true);
      setError(null);
      try {
        const result = await listPaymentsUseCase.executeForBooking(bookingId);
        setPayments(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payments');
      } finally {
        setLoading(false);
      }
    },
  };
}

