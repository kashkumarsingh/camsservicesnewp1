/**
 * Payment Filter Options
 * 
 * Clean Architecture: Application Layer (DTO)
 * Purpose: Filter options for listing payments
 */

export interface PaymentFilterOptions {
  payableType?: string; // e.g., 'App\Models\Booking'
  payableId?: string; // e.g., booking ID
  status?: string; // Payment status filter
  paymentMethod?: string; // Payment method filter
  startDate?: Date; // Filter payments from this date
  endDate?: Date; // Filter payments until this date
  minAmount?: number; // Minimum payment amount
  maxAmount?: number; // Maximum payment amount
}

