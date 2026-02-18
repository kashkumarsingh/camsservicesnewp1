/**
 * Get Payment Use Case
 * Orchestrates retrieval of a single payment
 * 
 * Clean Architecture: Application Layer (Use Case)
 */

import { IPaymentRepository } from '../ports/IPaymentRepository';
import { PaymentDTO } from '../dto/PaymentDTO';

export class GetPaymentUseCase {
  constructor(private readonly paymentRepository: IPaymentRepository) {}

  async execute(id: string): Promise<PaymentDTO | null> {
    return await this.paymentRepository.findById(id);
  }

  async executeByTransactionId(transactionId: string): Promise<PaymentDTO | null> {
    return await this.paymentRepository.findByTransactionId(transactionId);
  }
}

