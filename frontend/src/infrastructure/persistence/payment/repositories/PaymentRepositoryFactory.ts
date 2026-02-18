/**
 * Payment Repository Factory
 * Creates payment repository instances based on type
 * 
 * Clean Architecture: Infrastructure Layer (Factory)
 */

import { IPaymentRepository } from '@/core/application/payment/ports/IPaymentRepository';
import { ApiPaymentRepository } from './ApiPaymentRepository';

export type PaymentRepositoryType = 'static' | 'api';

/**
 * Create payment repository based on type
 */
export function createPaymentRepository(type?: PaymentRepositoryType): IPaymentRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_PAYMENT_REPOSITORY as PaymentRepositoryType) || 'api';

  switch (repoType) {
    case 'api':
      return new ApiPaymentRepository();
    case 'static':
    default:
      // Static repository not implemented yet
      return new ApiPaymentRepository();
  }
}

/**
 * Default repository instance
 */
export const paymentRepository = createPaymentRepository();

