/**
 * Payment Mapper
 * Converts between Payment entities and DTOs
 * 
 * Clean Architecture: Application Layer (Mapper)
 * Purpose: Maps between Payment domain entity and PaymentDTO
 */

import { Payment } from '@/core/domain/payment';
import { PaymentDTO } from '../dto/PaymentDTO';

export class PaymentMapper {
  /**
   * Convert Payment entity to DTO
   */
  static toDTO(payment: Payment): PaymentDTO {
    return {
      id: payment.getId(),
      amount: payment.getAmount(),
      currency: payment.getCurrency(),
      paymentMethod: payment.getMethod().toString(),
      paymentProvider: payment.getPaymentProvider(),
      transactionId: payment.getTransactionId(),
      status: payment.getStatus().toString(),
      processedAt: payment.getProcessedAt(),
      createdAt: payment.getCreatedAt(),
      updatedAt: payment.getUpdatedAt(),
      failureReason: payment.getFailureReason(),
      failedAt: payment.getFailedAt(),
      refundedAt: payment.getRefundedAt(),
      retryCount: payment.getRetryCount(),
      lastRetryAt: payment.getLastRetryAt(),
      metadata: payment.getMetadata() ? JSON.parse(payment.getMetadata()!) : null,
      payableType: payment.getPayableType(),
      payableId: payment.getPayableId(),
    };
  }

  /**
   * Convert DTO to Payment entity
   */
  static toEntity(dto: PaymentDTO): Payment {
    return Payment.restore({
      id: dto.id,
      amount: dto.amount,
      currency: dto.currency,
      method: dto.paymentMethod,
      status: dto.status,
      paymentProvider: dto.paymentProvider,
      transactionId: dto.transactionId,
      payableType: dto.payableType,
      payableId: dto.payableId,
      metadata: dto.metadata ? JSON.stringify(dto.metadata) : null,
      failureReason: dto.failureReason,
      processedAt: dto.processedAt,
      failedAt: dto.failedAt,
      refundedAt: dto.refundedAt,
      retryCount: dto.retryCount,
      lastRetryAt: dto.lastRetryAt,
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt ?? dto.createdAt,
    });
  }

  /**
   * Convert array of DTOs to entities
   */
  static toEntities(dtos: PaymentDTO[]): Payment[] {
    return dtos.map((dto) => this.toEntity(dto));
  }

  /**
   * Convert array of entities to DTOs
   */
  static toDTOs(payments: Payment[]): PaymentDTO[] {
    return payments.map((payment) => this.toDTO(payment));
  }
}

