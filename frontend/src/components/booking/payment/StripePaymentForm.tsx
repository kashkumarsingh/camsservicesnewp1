'use client';

import React, { useState, useEffect } from 'react';
import type { Stripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { CreditCard, Loader2, CheckCircle, XCircle, Lock, AlertCircle } from 'lucide-react';
import { PaymentGatewayManager } from '@/infrastructure/services/payment/PaymentGatewayManager';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import type { PaymentMethod, PaymentStatus } from '@/infrastructure/services/payment';

interface StripePaymentFormProps {
  bookingId: string;
  amount: number;
  onPaymentComplete: (method: PaymentMethod, transactionId: string) => void;
  onPaymentFailed: (method: PaymentMethod, error: string) => void;
  disabled?: boolean;
  externalPaymentStatus?: PaymentStatus;
}

/**
 * Inner component that uses Stripe hooks (must be inside Elements provider)
 */
function StripePaymentFormInner({
  bookingId,
  amount,
  onPaymentComplete,
  onPaymentFailed,
  disabled = false,
  externalPaymentStatus,
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [internalPaymentStatus, setInternalPaymentStatus] = useState<PaymentStatus>('pending');
  const paymentStatus = externalPaymentStatus || internalPaymentStatus;
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);

  // Create payment intent when component mounts
  useEffect(() => {
    if (!bookingId || amount <= 0 || clientSecret) return;

    const createIntent = async () => {
      setIsCreatingIntent(true);
      setErrorMessage(null);

      try {
        // Log for debugging bookingId alignment with backend
        console.debug('[StripePaymentForm] Creating payment intent', {
          bookingId,
          amount,
        });

        const result = await PaymentGatewayManager.createPaymentIntent(
          bookingId,
          amount,
          'GBP',
          'stripe'
        );

        // Log full result for debugging
        console.debug('[StripePaymentForm] Payment intent result:', {
          success: result.success,
          hasClientSecret: !!result.clientSecret,
          hasCheckoutUrl: !!result.checkoutUrl,
          hasPaymentIntentId: !!result.paymentIntentId,
          error: result.error,
          fullResult: result,
        });

        if (!result.success) {
          const errorMsg = result.error || 'Failed to initialize payment';
          setInternalPaymentStatus('failed');
          setErrorMessage(errorMsg);
          
          // Log detailed error for debugging
          PaymentGatewayManager.reportError(
            { message: errorMsg, bookingId, amount, result },
            'StripePaymentForm payment intent failed'
          );
          
          onPaymentFailed('stripe', errorMsg);
          return;
        }

        // Check if we have either clientSecret (for Elements) or checkoutUrl (for Checkout)
        // Note: Backend may return checkout_url instead of client_secret (Stripe Checkout vs Elements)
        if (!result.clientSecret && !result.checkoutUrl) {
          const errorMsg = 'Payment initialized but no payment method available. Please try again.';
          setInternalPaymentStatus('failed');
          setErrorMessage(errorMsg);
          
          PaymentGatewayManager.reportError(
            { message: 'Missing clientSecret and checkoutUrl', bookingId, amount, result },
            'StripePaymentForm payment intent'
          );
          
          onPaymentFailed('stripe', errorMsg);
          return;
        }

        // If we have checkoutUrl but no clientSecret, the outer component will handle it
        // For Stripe Elements, we need clientSecret
        if (result.checkoutUrl && !result.clientSecret) {
          // This is handled by the outer component - it will show checkout button
          // Don't set clientSecret here, let the outer component handle checkout
          console.debug('[StripePaymentForm] Checkout URL received, outer component will handle it');
          return;
        }

        // We have clientSecret for Stripe Elements
        setClientSecret(result.clientSecret ?? null);
        setPaymentIntentId(result.paymentIntentId ?? null);
        setInternalPaymentStatus('pending');
      } catch (error: any) {
        const errorMsg = error.message || 'Failed to initialize payment';
        setInternalPaymentStatus('failed');
        setErrorMessage(errorMsg);
        
        // Log detailed error for debugging
        PaymentGatewayManager.reportError(error, 'StripePaymentForm payment intent creation');
        
        onPaymentFailed('stripe', errorMsg);
      } finally {
        setIsCreatingIntent(false);
      }
    };

    createIntent();
  }, [bookingId, amount, clientSecret, onPaymentFailed]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || disabled || paymentStatus !== 'pending') {
      return;
    }

    setInternalPaymentStatus('processing');
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setInternalPaymentStatus('failed');
      setErrorMessage('Card element not found');
      return;
    }

    try {
      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              // You can add billing details here if needed
            },
          },
        }
      );

      if (stripeError) {
        setInternalPaymentStatus('failed');
        setErrorMessage(stripeError.message || 'Payment failed');
        onPaymentFailed('stripe', stripeError.message || 'Payment failed');
        return;
      }

      if (!paymentIntent || paymentIntent.status !== 'succeeded') {
        setInternalPaymentStatus('failed');
        setErrorMessage('Payment was not completed');
        onPaymentFailed('stripe', 'Payment was not completed');
        return;
      }

      // Confirm payment with backend
      const confirmResult = await ApiPaymentService.confirmPayment(paymentIntent.id);

      if (!confirmResult.success) {
        setInternalPaymentStatus('failed');
        setErrorMessage(confirmResult.error || 'Payment confirmation failed');
        onPaymentFailed('stripe', confirmResult.error || 'Payment confirmation failed');
        return;
      }

      // Success - wait for backend confirmation via externalPaymentStatus
      setInternalPaymentStatus('processing');
      onPaymentComplete('stripe', paymentIntent.id);
    } catch (error: any) {
      setInternalPaymentStatus('failed');
      setErrorMessage(error.message || 'Payment processing failed');
      onPaymentFailed('stripe', error.message || 'Payment processing failed');
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Element */}
      {isCreatingIntent ? (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="text-blue-600 animate-spin" size={20} />
            <span className="text-sm text-gray-700 dark:text-gray-300">Initializing payment...</span>
          </div>
        </div>
      ) : clientSecret ? (
        <div className="p-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-lg">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Card Details
          </label>
          <CardElement options={cardElementOptions} />
        </div>
      ) : null}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-lg">
          <div className="flex items-start gap-3">
            <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Payment Error</p>
              <p className="text-xs text-red-700 dark:text-red-300 mb-2">{errorMessage}</p>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setInternalPaymentStatus('pending');
                  setClientSecret(null);
                  // Trigger retry by clearing clientSecret
                }}
                className="text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      {clientSecret && paymentStatus === 'pending' && (
        <button
          type="submit"
          disabled={!stripe || disabled || paymentStatus !== 'pending'}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-[#635BFF] hover:bg-[#5A52E5] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Lock size={20} />
          <span>Pay {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(amount)}</span>
        </button>
      )}

      {/* Processing State */}
      {paymentStatus === 'processing' && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="text-blue-600 dark:text-blue-400 animate-spin" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">Processing payment...</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Please wait while we confirm your payment.</p>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {paymentStatus === 'completed' && paymentIntentId && (
        <div className="p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-900 dark:text-green-100">Payment Successful!</p>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">Transaction ID: {paymentIntentId}</p>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

/** Show parent-friendly message; hide technical details like .env or STRIPE_SECRET_KEY. */
function toParentFriendlyMessage(error: string | null): string {
  if (!error) return 'Something went wrong. Please try again.';
  if (
    error.includes('STRIPE_SECRET_KEY') ||
    error.includes('.env') ||
    error.toLowerCase().includes('not configured')
  ) {
    return 'Payment is temporarily unavailable. Please try again later or contact us.';
  }
  return error;
}

/** Retry fetching checkout URL (single source for retry logic). */
async function fetchCheckout(
  bookingId: string,
  amount: number,
  setCheckoutUrl: (url: string | null) => void,
  setCheckoutError: (msg: string | null) => void,
  setIsLoadingCheckout: (v: boolean) => void
): Promise<void> {
  setCheckoutError(null);
  setIsLoadingCheckout(true);
  try {
    const result = await PaymentGatewayManager.createPaymentIntent(bookingId, amount, 'GBP', 'stripe');
    if (result.success && result.checkoutUrl) {
      setCheckoutUrl(result.checkoutUrl);
      setCheckoutError(null);
    } else {
      setCheckoutError(result.error || 'Failed to create payment session');
      setCheckoutUrl(null);
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; error?: string } }; message?: string };
    const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? 'Unable to load payment. Please try again.';
    setCheckoutError(msg);
    setCheckoutUrl(null);
  } finally {
    setIsLoadingCheckout(false);
  }
}

export const StripePaymentForm: React.FC<StripePaymentFormProps> = (props) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const [isStripeBlocked, setIsStripeBlocked] = useState(false);

  // Primary path: fetch checkout URL from backend (works regardless of ad blocker – redirect to Stripe)
  useEffect(() => {
    if (!props.bookingId || props.amount <= 0) return;
    fetchCheckout(
      props.bookingId,
      props.amount,
      setCheckoutUrl,
      setCheckoutError,
      setIsLoadingCheckout
    );
  }, [props.bookingId, props.amount]);

  // Detect when Stripe.js failed to load (e.g. blocked by ad blocker)
  useEffect(() => {
    PaymentGatewayManager.getStripe()
      .then((stripeInstance) => {
        if (stripeInstance) {
          setStripe(stripeInstance);
          setIsStripeBlocked(false);
        } else {
          setIsStripeBlocked(true);
        }
      })
      .catch(() => setIsStripeBlocked(true));
  }, []);

  // Prioritize checkout (like OpenAI) - it's more reliable with ad blockers
  // Show checkout button if we have the URL, regardless of Elements status
  // This is the recommended approach when ad blockers might block Stripe.js
  if (checkoutUrl) {
    const formattedAmount = new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(props.amount);

    return (
      <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-lg">
        <div className="mb-4">
          <p className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Complete Your Payment</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Your payment is securely processed. We never store your card details.
          </p>
        </div>
        <button
          onClick={() => {
            window.location.href = checkoutUrl;
          }}
          disabled={isLoadingCheckout}
          className="w-full bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-blue/90 hover:to-light-blue-cyan/90 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoadingCheckout ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Lock size={18} />
              <span>Pay Now - {formattedAmount}</span>
            </>
          )}
        </button>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-3 text-center">
          🔒 Secure payment - Your card details are never stored
        </p>
      </div>
    );
  }

  // API/backend error: show actual error first (never show ad-blocker when we have a clear API error)
  if (checkoutError && !checkoutUrl && !isLoadingCheckout) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-lg space-y-4">
        <div className="flex items-start gap-3">
          <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Payment couldn’t load</p>
            <p className="text-xs text-red-800 dark:text-red-300 mb-3">
              {toParentFriendlyMessage(checkoutError)}
            </p>
            <button
              type="button"
              onClick={() =>
                fetchCheckout(
                  props.bookingId,
                  props.amount,
                  setCheckoutUrl,
                  setCheckoutError,
                  setIsLoadingCheckout
                )
              }
              className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Ad blocker likely: Stripe.js failed to load and we have no checkout URL and no API error
  if (isStripeBlocked && !checkoutUrl && !checkoutError && !isLoadingCheckout) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700 rounded-lg space-y-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-2">Payment form could not load</p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mb-3">
              An ad blocker or browser extension may be blocking payment. Try disabling it for this site, then refresh and try again.
            </p>
            <button
              type="button"
              onClick={() => {
                setIsStripeBlocked(false);
                window.location.reload();
              }}
              className="text-xs font-medium text-amber-900 dark:text-amber-200 hover:text-amber-950 dark:hover:text-amber-100 underline"
            >
              I&apos;ve disabled my ad blocker – Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No checkout URL, no API error, not ad-blocker: generic fallback
  if (!checkoutUrl && !isLoadingCheckout) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-lg space-y-4">
        <div className="flex items-start gap-3">
          <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-2">Payment couldn’t load</p>
            <p className="text-xs text-red-800 dark:text-red-300 mb-3">Something went wrong. Please try again.</p>
            <button
              type="button"
              onClick={() =>
                fetchCheckout(
                  props.bookingId,
                  props.amount,
                  setCheckoutUrl,
                  setCheckoutError,
                  setIsLoadingCheckout
                )
              }
              className="text-sm font-medium text-red-800 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stripe) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-lg">
        <div className="flex items-center gap-3">
          <Loader2 className="text-gray-600 dark:text-gray-400 animate-spin" size={20} />
          <span className="text-sm text-gray-700 dark:text-gray-300">Loading payment form...</span>
        </div>
      </div>
    );
  }

  // Use Stripe 'night' theme when document is in dark mode (matches app theme)
  const isDark =
    typeof document !== 'undefined' &&
    (document.documentElement.classList.contains('dark') ||
      (!document.documentElement.classList.contains('light') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches));
  const options: StripeElementsOptions = {
    appearance: {
      theme: isDark ? 'night' : 'stripe',
    },
  };

  return (
    <Elements stripe={stripe} options={options}>
      <StripePaymentFormInner {...props} />
    </Elements>
  );
};

