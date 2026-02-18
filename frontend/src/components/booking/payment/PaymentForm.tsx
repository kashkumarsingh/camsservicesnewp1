'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { CreditCard, ExternalLink, Loader2, CheckCircle, XCircle, Lock, AlertCircle } from 'lucide-react';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import type { PaymentMethod, PaymentStatus } from '@/infrastructure/services/payment';

// Re-export types for backward compatibility
export type { PaymentMethod, PaymentStatus };

interface PaymentFormProps {
  bookingId?: string;
  amount: number;
  onPaymentComplete: (method: PaymentMethod, transactionId: string) => void;
  onPaymentFailed: (method: PaymentMethod, error: string) => void;
  disabled?: boolean;
  externalPaymentStatus?: PaymentStatus;
}

const PaymentForm = ({
  bookingId,
  amount,
  onPaymentComplete,
  onPaymentFailed,
  disabled = false,
  externalPaymentStatus,
}: PaymentFormProps) => {
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const paymentStatus = externalPaymentStatus || 'pending';
  const hasFetchedRef = React.useRef(false);

  // Fetch checkout URL function (extracted for retry functionality)
  const fetchCheckoutUrl = React.useCallback(async () => {
    // Don't fetch if:
    // - bookingId is missing/placeholder
    // - amount is invalid
    if (!bookingId || bookingId === 'pending' || amount <= 0) {
      if (bookingId === 'pending') {
        setError('Waiting for booking to be created...');
      }
      return;
    }

    // Mark as fetched immediately to prevent concurrent calls
    hasFetchedRef.current = true;

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await ApiPaymentService.createPaymentIntent(
        bookingId,
        amount,
        'GBP',
        'stripe'
      );

      if (result.success && result.checkoutUrl) {
        setCheckoutUrl(result.checkoutUrl);
        setRetryCount(0); // Reset retry count on success
      } else {
        // Show detailed error message from backend
        const errorMessage = result.error || 'Failed to initialize payment';
        setError(errorMessage);
        onPaymentFailed('stripe', errorMessage);
        // Reset ref on error to allow retry
        hasFetchedRef.current = false;
      }
    } catch (err: any) {
      // Extract detailed error message
      let errorMsg = 'Failed to initialize payment';
      
      if (err?.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err?.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err?.message) {
        errorMsg = err.message;
      }
      
      // Log detailed error for debugging
      console.error('[PaymentForm] Payment initialization failed:', {
        bookingId,
        amount,
        error: errorMsg,
        fullError: err,
        retryCount,
      });
      
      setError(errorMsg);
      onPaymentFailed('stripe', errorMsg);
      // Reset ref on error to allow retry
      hasFetchedRef.current = false;
    } finally {
      setIsLoading(false);
    }
  }, [bookingId, amount, onPaymentFailed]);

  // Initial fetch when component mounts or dependencies change
  useEffect(() => {
    // Don't fetch if we've already fetched for this booking/amount
    // NOTE: we intentionally do NOT depend on disabled or paymentStatus here to avoid
    // creating multiple payment intents when parent state changes.
    if (hasFetchedRef.current) {
      return;
    }

    fetchCheckoutUrl();
  }, [bookingId, amount, fetchCheckoutUrl]);

  // Reset fetch flag when bookingId changes
  useEffect(() => {
    hasFetchedRef.current = false;
    setCheckoutUrl(null);
    setError(null);
    setRetryCount(0);
  }, [bookingId]);

  // Retry handler
  const handleRetry = React.useCallback(() => {
    if (retryCount >= 3) {
      setError('Maximum retry attempts reached. Please refresh the page or contact support if the issue persists.');
      return;
    }
    
    setRetryCount(prev => prev + 1);
    hasFetchedRef.current = false;
    setError(null);
    fetchCheckoutUrl();
  }, [retryCount, fetchCheckoutUrl]);

  // Redirect to checkout when URL is ready
  const handleCheckout = () => {
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300 shadow-lg">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
          <CreditCard className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-[#1E3A5F]">Payment Required</h3>
          <p className="text-xs text-gray-600">Secure payment to confirm your booking</p>
        </div>
        {paymentStatus === 'completed' && (
          <div className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full border border-green-300">
            <CheckCircle size={16} />
            <span className="text-xs font-semibold">Paid</span>
          </div>
        )}
      </div>

      {/* Amount Display */}
      <div className="bg-white rounded-lg p-4 border-2 border-green-200 mb-4">
        <div className="text-center">
          <p className="text-xs text-gray-600 mb-1">Total Amount</p>
          <div className="text-3xl font-extrabold text-[#0080FF] mb-2">
            £{amount.toFixed(2)}
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-gray-600">
            <Lock size={12} />
            <span>Secure • Encrypted • Protected</span>
          </div>
        </div>
      </div>

      {/* Payment Status Messages */}
      {paymentStatus === 'processing' && (
        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="text-blue-600 animate-spin" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900">Processing payment...</p>
              <p className="text-xs text-blue-700 mt-1">Please wait while we process your payment.</p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'completed' && (
        <div className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900">Payment Successful!</p>
              <p className="text-xs text-green-700 mt-1">Your booking has been confirmed.</p>
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 mb-1">Payment Failed</p>
              <p className="text-xs text-red-700">Please try again or contact support if the issue persists.</p>
            </div>
          </div>
        </div>
      )}

      {/* Payment Button - Only show when pending */}
      {paymentStatus === 'pending' && (
        <div className="space-y-3">
          {!bookingId ? (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="text-yellow-600" size={20} />
                <div>
                  <p className="text-sm font-semibold text-yellow-800">Booking Required</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please complete the booking details first. The payment button will appear once your booking is created.
                  </p>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Loader2 className="text-blue-600 animate-spin" size={20} />
                <div>
                  <p className="text-sm font-semibold text-blue-800">Preparing Payment</p>
                  <p className="text-xs text-blue-700 mt-1">Setting up secure checkout...</p>
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <XCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-red-900 mb-1">Payment Failed</p>
                  <p className="text-xs text-red-700 mb-3">{error}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleRetry}
                      disabled={isLoading || retryCount >= 3}
                      className="text-xs font-semibold text-red-700 hover:text-red-900 underline disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Retrying...' : 'Try Again'}
                    </button>
                    {retryCount >= 3 && (
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs font-semibold text-red-700 hover:text-red-900 underline ml-2"
                      >
                        Refresh page
                      </button>
                    )}
                  </div>
                  {retryCount > 0 && retryCount < 3 && (
                    <p className="text-xs text-red-600 mt-2">
                      Retry attempt {retryCount} of 3
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : checkoutUrl ? (
            <button
              onClick={handleCheckout}
              disabled={disabled}
              className="w-full bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white px-6 py-4 rounded-lg font-semibold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock size={18} />
              <span>Continue to Secure Checkout</span>
              <ExternalLink size={18} />
            </button>
          ) : null}

          <p className="text-xs text-center text-gray-600 mt-2">
            🔒 Your payment is secure and encrypted
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;
