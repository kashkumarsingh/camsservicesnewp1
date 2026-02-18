/**
 * Payment Validator
 * 
 * Validates payment-related data.
 */

import { PaymentMethod } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export class PaymentValidator {
  /**
   * Validate payment method and amount
   */
  static validate(method: PaymentMethod, amount: number): ValidationResult {
    const errors: string[] = [];

    if (!method) {
      errors.push('Payment method is required');
    }

    if (amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (amount > 100000) {
      errors.push('Amount exceeds maximum limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate amount only
   */
  static validateAmount(amount: number): ValidationResult {
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push('Amount must be greater than 0');
    }

    if (amount > 100000) {
      errors.push('Amount exceeds maximum limit');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

