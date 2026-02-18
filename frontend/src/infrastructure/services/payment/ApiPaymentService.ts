/**
 * API Payment Service
 * 
 * Clean Architecture: Infrastructure Layer (Payment Gateway Adapter)
 * Purpose: Handles payment processing via backend API with Stripe
 * Location: frontend/src/infrastructure/services/payment/ApiPaymentService.ts
 * 
 * This service:
 * - Creates payment intents via backend API
 * - Uses Stripe.js for client-side payment confirmation
 * - Handles payment status updates
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import type { PaymentMethod, PaymentStatus, PaymentResult } from './types';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Initialize Stripe (lazy load)
 */
function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;
    
    if (!stripePublicKey) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not set. Stripe payments will not work.');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(stripePublicKey);
    }
  }
  
  return stripePromise;
}

export interface CreatePaymentIntentRequest {
  bookingId: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
}

export interface CreatePaymentIntentResponse {
  success: boolean;
  data?: {
    payment_intent_id: string;
    client_secret: string;
    checkout_url?: string;
    payment_id?: number;
  };
  message?: string;
}

export interface ConfirmPaymentRequest {
  payment_intent_id: string;
}

export interface ConfirmPaymentResponse {
  success: boolean;
  data?: {
    booking: any;
    payment: any;
  };
  message?: string;
}

export class ApiPaymentService {
  /**
   * Create a payment intent for a booking.
   */
  static async createPaymentIntent(
    bookingId: string,
    amount: number,
    currency: string = 'GBP',
    paymentMethod: string = 'stripe'
  ): Promise<{ success: boolean; paymentIntentId?: string; clientSecret?: string; checkoutUrl?: string; error?: string }> {
    try {
      const response = await apiClient.post<{ payment_intent_id?: string; client_secret?: string; checkout_url?: string }>(
        API_ENDPOINTS.CREATE_PAYMENT_INTENT(bookingId),
        {
          amount,
          currency,
          payment_method: paymentMethod,
        }
      );

      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      // So response.data is already the payment intent data
      const paymentData = response.data;

      if (!paymentData || (!paymentData.payment_intent_id && !paymentData.checkout_url)) {
        return {
          success: false,
          error: 'Failed to create payment intent - invalid response from server',
        };
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiPaymentService] Payment intent created:', {
          hasPaymentIntentId: !!paymentData.payment_intent_id,
          hasClientSecret: !!paymentData.client_secret,
          hasCheckoutUrl: !!paymentData.checkout_url,
        });
      }

      return {
        success: true,
        paymentIntentId: paymentData.payment_intent_id,
        clientSecret: paymentData.client_secret,
        checkoutUrl: paymentData.checkout_url,
      };
    } catch (error: any) {
      // Extract detailed error message from backend response
      let errorMsg = 'Failed to initialize payment';
      
      // Try multiple ways to extract error message
      if (error?.response?.data?.message) {
        // Backend returns { success: false, message: "...", ... }
        errorMsg = error.response.data.message;
      } else if (error?.response?.data?.error) {
        // Some errors might use 'error' field
        errorMsg = error.response.data.error;
      } else if (error?.response?.data?.errors) {
        // Validation errors might be in 'errors' object
        const errors = error.response.data.errors;
        if (typeof errors === 'string') {
          errorMsg = errors;
        } else if (Array.isArray(errors) && errors.length > 0) {
          errorMsg = errors[0];
        } else if (typeof errors === 'object') {
          // Extract first error message from object
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            errorMsg = firstError[0];
          } else if (typeof firstError === 'string') {
            errorMsg = firstError;
          }
        }
      } else if (error?.message) {
        // Fallback to error message
        errorMsg = error.message;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      
      // Log detailed error for debugging
      console.error('[ApiPaymentService] Payment intent creation failed:', {
        bookingId,
        amount,
        error: errorMsg,
        fullError: error,
        responseStatus: error?.response?.status,
        responseData: error?.response?.data,
        requestUrl: error?.config?.url,
        requestMethod: error?.config?.method,
      });
      
      return {
        success: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Process Stripe payment using Stripe.js Elements.
   */
  static async processStripePayment(
    bookingId: string,
    amount: number,
    clientSecret: string
  ): Promise<PaymentResult> {
    try {
      const stripe = await getStripe();
      
      if (!stripe) {
        return {
          success: false,
          error: 'Stripe is not initialized. Please check your configuration.',
          method: 'stripe',
          amount,
          status: 'failed',
        };
      }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret);

      if (stripeError) {
        return {
          success: false,
          error: stripeError.message || 'Payment failed',
          method: 'stripe',
          amount,
          status: 'failed',
        };
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        return {
          success: false,
          error: 'Payment was not completed',
          method: 'stripe',
          amount,
          status: 'failed',
        };
      }

      // Confirm payment with backend
      // Handle case where API_ENDPOINTS might be undefined at runtime (build cache issue)
      let confirmEndpoint: string;
      
      if (typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS?.CONFIRM_PAYMENT) {
        confirmEndpoint = API_ENDPOINTS.CONFIRM_PAYMENT;
      } else {
        confirmEndpoint = '/payments/confirm';
      }
      
      // Final validation - ensure endpoint is a valid string
      if (!confirmEndpoint || typeof confirmEndpoint !== 'string') {
        const errorMsg = 'Payment confirmation endpoint is not available. Please check API_ENDPOINTS configuration.';
        console.error('[ApiPaymentService]', errorMsg, {
          hasApiEndpoints: typeof API_ENDPOINTS !== 'undefined',
          confirmPaymentValue: typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS?.CONFIRM_PAYMENT : 'API_ENDPOINTS is undefined',
          confirmEndpoint,
        });
        throw new Error(errorMsg);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiPaymentService] Confirming payment with endpoint:', confirmEndpoint);
      }
      
      const confirmResponse = await apiClient.post<ConfirmPaymentResponse>(
        confirmEndpoint,
        {
          payment_intent_id: paymentIntent.id,
        }
      );

      if (!confirmResponse.data.success) {
        return {
          success: false,
          error: confirmResponse.data.message || 'Payment confirmation failed',
          method: 'stripe',
          amount,
          status: 'failed',
        };
      }

      return {
        success: true,
        method: 'stripe',
        amount,
        status: 'completed',
        transactionId: paymentIntent.id,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment processing failed',
        method: 'stripe',
        amount,
        status: 'failed',
      };
    }
  }

  /**
   * Confirm payment (for webhook-based flows).
   */
  static async confirmPayment(paymentIntentId: string): Promise<{ 
    success: boolean; 
    error?: string;
    booking?: any;
    payment?: any;
  }> {
    try {
      // Use the correct constant name with defensive fallback
      // Handle case where API_ENDPOINTS might be undefined at runtime (build cache issue)
      let endpoint: string;
      
      if (typeof API_ENDPOINTS !== 'undefined' && API_ENDPOINTS?.CONFIRM_PAYMENT) {
        endpoint = API_ENDPOINTS.CONFIRM_PAYMENT;
      } else {
        endpoint = '/payments/confirm';
      }
      
      // Final validation - ensure endpoint is a valid string
      if (!endpoint || typeof endpoint !== 'string') {
        const errorMsg = 'Payment confirmation endpoint is not available. Please check API_ENDPOINTS configuration.';
        console.error('[ApiPaymentService]', errorMsg, {
          hasApiEndpoints: typeof API_ENDPOINTS !== 'undefined',
          confirmPaymentValue: typeof API_ENDPOINTS !== 'undefined' ? API_ENDPOINTS?.CONFIRM_PAYMENT : 'API_ENDPOINTS is undefined',
          endpoint,
        });
        throw new Error(errorMsg);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiPaymentService] Confirming payment with endpoint:', endpoint);
      }
      
      const response = await apiClient.post<{
        booking?: any;
        payment?: any;
        success?: boolean;
        message?: string;
      }>(
        endpoint,
        {
          payment_intent_id: paymentIntentId,
        }
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('[ApiPaymentService] Payment confirmation response:', {
          hasData: !!response.data,
          dataKeys: response.data ? Object.keys(response.data) : [],
          hasBooking: !!response.data?.booking,
          hasPayment: !!response.data?.payment,
          fullResponse: response.data,
        });
      }

      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      // So response.data is the actual data (booking, payment)
      // Check if we have the expected data structure
      if (response.data?.booking && response.data?.payment) {
        return { 
          success: true,
          booking: response.data.booking,
          payment: response.data.payment,
        };
      }

      // If no booking/payment, check for success flag (fallback)
      if (response.data?.success === false) {
        return {
          success: false,
          error: response.data.message || 'Payment confirmation failed',
        };
      }

      // If we get here, something unexpected happened
      if (process.env.NODE_ENV === 'development') {
        console.error('[ApiPaymentService] Unexpected response format:', response.data);
      }
      return {
        success: false,
        error: 'Payment confirmation failed - unexpected response format',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Payment confirmation failed',
      };
    }
  }
}

