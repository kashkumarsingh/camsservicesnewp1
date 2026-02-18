/**
 * usePayment Hook
 * Provides a composable way to interact with single payment use cases
 * 
 * Clean Architecture: Interface Layer (React Hook)
 */

'use client';

import { useState, useEffect } from 'react';
import { GetPaymentUseCase } from '@/core/application/payment/useCases/GetPaymentUseCase';
import { PaymentDTO } from '@/core/application/payment/dto/PaymentDTO';
import { paymentRepository } from '@/infrastructure/persistence/payment';

export function usePayment(id?: string, transactionId?: string) {
  const [payment, setPayment] = useState<PaymentDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const getPaymentUseCase = new GetPaymentUseCase(paymentRepository);

  useEffect(() => {
    if (!id && !transactionId) {
      return;
    }

    const fetchPayment = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = id
          ? await getPaymentUseCase.execute(id)
          : await getPaymentUseCase.executeByTransactionId(transactionId!);
        setPayment(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payment');
        setPayment(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [id, transactionId]);

  return {
    payment,
    loading,
    error,
    refetch: async () => {
      if (!id && !transactionId) return;
      setLoading(true);
      setError(null);
      try {
        const result = id
          ? await getPaymentUseCase.execute(id)
          : await getPaymentUseCase.executeByTransactionId(transactionId!);
        setPayment(result);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch payment');
      } finally {
        setLoading(false);
      }
    },
  };
}

