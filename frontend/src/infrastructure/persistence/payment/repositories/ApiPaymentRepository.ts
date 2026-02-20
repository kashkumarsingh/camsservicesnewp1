/**
 * API Payment Repository
 * Implements IPaymentRepository for Laravel API integration
 * 
 * Clean Architecture: Infrastructure Layer (Data Access)
 * Uses centralized API_ENDPOINTS constants for CMS-agnostic endpoint management
 * 
 * Note: Payments are primarily fetched as part of booking responses.
 * This repository provides methods to work with payments independently when needed.
 */

import { IPaymentRepository } from '@/core/application/payment/ports/IPaymentRepository';
import { PaymentDTO } from '@/core/application/payment/dto/PaymentDTO';
import { PaymentFilterOptions } from '@/core/application/payment/dto/PaymentFilterOptions';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Remote Payment Response (from backend API)
 * Matches backend PaymentController formatBookingResponse structure
 */
interface RemotePaymentResponse {
  id: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentProvider: string | null;
  transactionId: string | null;
  status: string;
  processedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  failureReason?: string | null;
  failedAt?: string | null;
  refundedAt?: string | null;
  retryCount?: number;
  lastRetryAt?: string | null;
  metadata?: Record<string, any> | null;
  payableType?: string | null;
  payableId?: string | null;
}

export class ApiPaymentRepository implements IPaymentRepository {
  /**
   * Convert remote API response to PaymentDTO
   */
  private toDTO(response: RemotePaymentResponse): PaymentDTO {
    return {
      id: response.id,
      amount: response.amount,
      currency: response.currency,
      paymentMethod: response.paymentMethod,
      paymentProvider: response.paymentProvider,
      transactionId: response.transactionId,
      status: response.status,
      processedAt: response.processedAt,
      createdAt: response.createdAt,
      updatedAt: response.updatedAt,
      failureReason: response.failureReason,
      failedAt: response.failedAt,
      refundedAt: response.refundedAt,
      retryCount: response.retryCount,
      lastRetryAt: response.lastRetryAt,
      metadata: response.metadata,
      payableType: response.payableType,
      payableId: response.payableId,
    };
  }

  async findById(id: string): Promise<PaymentDTO | null> {
    try {
      // Note: Backend doesn't have a direct GET /payments/{id} endpoint
      // Payments are fetched as part of booking responses
      // This method would need a backend endpoint to be implemented
      // For now, return null (payments are accessed via bookings)
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByTransactionId(transactionId: string): Promise<PaymentDTO | null> {
    try {
      // Note: Backend doesn't have a direct GET /payments/transaction/{id} endpoint
      // Payments are fetched as part of booking responses
      // This method would need a backend endpoint to be implemented
      // For now, return null (payments are accessed via bookings)
      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findByPayable(payableType: string, payableId: string): Promise<PaymentDTO[]> {
    try {
      // Payments are included in booking responses
      // For bookings, fetch the booking which includes payments
      if (payableType === 'App\\Models\\Booking' || payableType === 'App\Models\Booking') {
        const response = await apiClient.get<{ success: boolean; data: { payments?: RemotePaymentResponse[] } }>(
          API_ENDPOINTS.BOOKING_BY_ID(payableId)
        );
        // Single-resource (booking) with nested payments; not a list endpoint — extractList does not apply. See .cursorrules LIST EXTRACTION.
        const payments = response.data.data?.payments || [];
        return payments.map((payment) => this.toDTO(payment));
      }

      // For other payable types, would need specific endpoints
      return [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async findAll(filterOptions?: PaymentFilterOptions): Promise<PaymentDTO[]> {
    try {
      // Note: Backend doesn't have a direct GET /payments endpoint
      // Payments are fetched as part of booking responses
      // This method would need a backend endpoint to be implemented
      // For now, return empty array (payments are accessed via bookings)
      return [];
    } catch (error: any) {
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  }
}

