'use client';

import React, { useState } from 'react';
import { CreditCard, X, Lock, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import BaseModal from '@/components/ui/Modal/BaseModal';
import { StripePaymentForm } from '@/components/booking/payment/StripePaymentForm';
import type { PaymentMethod } from '@/infrastructure/services/payment';
import type { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface CompletePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: BookingDTO;
  onPaymentComplete?: () => void;
  onPaymentFailed?: (error: string) => void;
}

/**
 * Complete Payment Modal Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Modal for completing payment without leaving dashboard
 * Location: frontend/src/components/dashboard/modals/CompletePaymentModal.tsx
 * 
 * Features:
 * - Stripe Elements embedded payment form
 * - Stays on dashboard (no navigation)
 * - Auto-closes on success
 * - Shows payment status
 * - Handles errors gracefully
 */
export default function CompletePaymentModal({
  isOpen,
  onClose,
  booking,
  onPaymentComplete,
  onPaymentFailed,
}: CompletePaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

  // Calculate outstanding amount
  // For draft bookings with pending hours, calculate from hours × hourly rate
  // Otherwise, use booking's outstanding amount
  const calculateOutstandingAmount = () => {
    // If booking has outstanding amount, use it
    if (booking.outstandingAmount !== undefined && booking.outstandingAmount > 0) {
      return booking.outstandingAmount;
    }
    
    // For draft bookings, calculate from pending hours
    if (booking.status === 'draft' && booking.package && booking.totalHours) {
      const packagePrice = booking.package.price || 0;
      const packageHours = booking.package.hours || 0;
      
      if (packageHours > 0) {
        // Calculate hourly rate: package price / package hours
        const hourlyRate = packagePrice / packageHours;
        // Calculate amount due: pending hours × hourly rate
        const pendingHoursAmount = booking.totalHours * hourlyRate;
        return Math.max(0, pendingHoursAmount);
      }
    }
    
    // Fallback: use booking's calculated outstanding amount
    const totalAmount = booking.totalAmount || booking.totalPrice || 0;
    const paidAmount = booking.paidAmount || 0;
    const discountAmount = booking.discountAmount || 0;
    return Math.max(0, totalAmount - paidAmount - discountAmount);
  };
  
  const outstandingAmount = calculateOutstandingAmount();
  const isFullyPaid = outstandingAmount <= 0 || booking.paymentStatus === 'paid';

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setPaymentStatus('pending');
      setError(null);
    }
  }, [isOpen]);

  const handlePaymentComplete = (method: PaymentMethod, transactionId: string) => {
    setPaymentStatus('completed');
    
    // Auto-close modal after 2 seconds
    setTimeout(() => {
      onClose();
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    }, 2000);
  };

  const handlePaymentFailed = (method: PaymentMethod, errorMessage: string | object) => {
    setPaymentStatus('failed');
    
    // Extract error message from string or object
    let errorMsg: string;
    if (typeof errorMessage === 'string') {
      errorMsg = errorMessage;
    } else if (errorMessage && typeof errorMessage === 'object') {
      // Try to extract error message from object
      if ('message' in errorMessage && typeof errorMessage.message === 'string') {
        errorMsg = errorMessage.message;
      } else if ('error' in errorMessage && typeof errorMessage.error === 'string') {
        errorMsg = errorMessage.error;
      } else {
        // Fallback: stringify the object for debugging
        errorMsg = 'Payment failed. ' + JSON.stringify(errorMessage);
      }
    } else {
      errorMsg = 'Payment failed. Please try again.';
    }
    
    setError(errorMsg);
    
    // Log error details for debugging
    console.error('[CompletePaymentModal] Payment failed:', {
      bookingId: booking.id,
      bookingReference: booking.reference,
      outstandingAmount,
      method,
      errorMessage: errorMsg,
      originalError: errorMessage,
    });
    
    if (onPaymentFailed) {
      onPaymentFailed(errorMsg);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  // Dynamic header based on payment status (includes close button)
  const modalHeader = (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {isFullyPaid ? (
          <>
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <CheckCircle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payment Status</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Booking payment information</p>
            </div>
          </>
        ) : (
          <>
            <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
              <CreditCard className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Complete Payment</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">Secure payment to confirm your booking</p>
            </div>
          </>
        )}
      </div>
      {paymentStatus !== 'processing' && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto"
          aria-label="Close modal"
        >
          <X size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false} // We handle close button in custom header
      preventBackdropClose={paymentStatus === 'processing'}
      header={modalHeader}
    >
      <div className="p-6 space-y-4">
        {/* Booking Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Booking Reference</span>
            <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{booking.reference}</span>
          </div>
          {booking.package && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Package</span>
              <span className="text-sm text-gray-900 dark:text-gray-100">{booking.package.name}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Outstanding Amount</span>
            <span className={`text-lg font-bold ${outstandingAmount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-600 dark:text-gray-400'}`}>
              {formatCurrency(outstandingAmount)}
            </span>
          </div>
        </div>

        {/* Payment Status Messages */}
        {paymentStatus === 'completed' && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Payment Successful!</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">Your booking has been confirmed. Closing...</p>
              </div>
            </div>
          </div>
        )}

        {paymentStatus === 'failed' && error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Payment Failed</p>
                <p className="text-xs text-red-700 dark:text-red-300 mb-2">{error}</p>
                <button
                  onClick={() => {
                    setPaymentStatus('pending');
                    setError(null);
                  }}
                  className="text-xs font-medium text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Payment Already Complete Message */}
        {isFullyPaid && (
          <div className="p-4 bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600 dark:text-green-400" size={20} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-green-900 dark:text-green-100">Payment Already Complete</p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  This booking has been fully paid. No further payment is required.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment Form - Only show when there's outstanding amount and pending/processing */}
        {!isFullyPaid && outstandingAmount > 0 && (paymentStatus === 'pending' || paymentStatus === 'processing') ? (
          <div className="space-y-4">
            {/* Validate amount before showing form */}
            {outstandingAmount > 0 && booking.id ? (
              <StripePaymentForm
                bookingId={typeof booking.id === 'string' ? booking.id : String(booking.id)}
                amount={outstandingAmount}
                onPaymentComplete={handlePaymentComplete}
                onPaymentFailed={handlePaymentFailed}
                disabled={paymentStatus === 'processing'}
                externalPaymentStatus={paymentStatus}
              />
            ) : (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Unable to Process Payment</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      {!booking.id 
                        ? 'Booking ID is missing. Please contact support.'
                        : outstandingAmount <= 0
                        ? 'No outstanding amount to pay.'
                        : 'Invalid payment amount. Please contact support.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-blue-900 dark:text-blue-100">
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p>🔒 Secure payment - Your card details are never stored</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </BaseModal>
  );
}
