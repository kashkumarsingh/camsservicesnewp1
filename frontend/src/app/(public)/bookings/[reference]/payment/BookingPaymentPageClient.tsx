'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/formatDate';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import type { PaymentMethod } from '@/infrastructure/services/payment/types';
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  ArrowLeft,
  Package,
  Loader2,
  Lock,
} from 'lucide-react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button';
import PaymentForm from '@/components/booking/payment/PaymentForm';

interface BookingPaymentPageClientProps {
  reference: string;
}

const BookingPaymentPageClient: React.FC<BookingPaymentPageClientProps> = ({ reference }) => {
  const router = useRouter();
  const { booking, loading, error, refetch } = useBooking(undefined, reference);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');

  // All hooks must be called before any early returns
  const handlePaymentComplete = useCallback(async (method: PaymentMethod, transactionId: string) => {
    setPaymentStatus('processing');
    
    // Refresh booking data to get updated status
    await refetch();
    
    // Payment confirmation will be handled by the callback page or webhook
    // Just update local state
    setPaymentStatus('completed');
  }, [refetch]);

  const handlePaymentFailed = useCallback((method: PaymentMethod, error: string) => {
    setPaymentStatus('failed');
    console.error('Payment failed:', error);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0080FF] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center bg-red-50 border-red-200">
            <AlertCircle className="text-red-600 mx-auto mb-4" size={32} />
            <h3 className="text-xl font-semibold text-red-800 mb-2">Error Loading Booking</h3>
            <p className="text-red-700 text-sm mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Link href="/dashboard/parent">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <AlertCircle className="text-gray-400 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-semibold text-[#1E3A5F] mb-2">Booking Not Found</h3>
            <p className="text-gray-600 mb-4">The booking you're looking for doesn't exist or you don't have access to it.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => router.back()}>Go Back</Button>
              <Link href="/dashboard/parent">
                <Button variant="outline">Go to Dashboard</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate outstanding amount - use explicit calculation to handle edge cases
  const calculatedOutstanding = (booking.totalPrice || 0) - (booking.paidAmount || 0);
  const outstandingAmount = booking.outstandingAmount !== undefined 
    ? booking.outstandingAmount 
    : Math.max(0, calculatedOutstanding);
  
  // Check if fully paid - consider both payment status and amount
  const isFullyPaid = 
    booking.paymentStatus === 'paid' || 
    (outstandingAmount <= 0 && (booking.paidAmount || 0) >= (booking.totalPrice || 0));
  
  const isCancelled = booking.status === 'cancelled' || booking.status === 'canceled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/bookings/${booking.reference}`} className="inline-flex items-center gap-2 text-[#0080FF] hover:text-[#0066CC] mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Booking Details</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[#1E3A5F] mb-2">
            {isFullyPaid ? 'Payment Status' : 'Complete Payment'}
          </h1>
          <p className="text-gray-600">Booking Reference: <span className="font-mono font-semibold">{booking.reference}</span></p>
          {isFullyPaid && (
            <p className="text-sm text-green-700 mt-1 flex items-center gap-1">
              <CheckCircle size={16} />
              <span className="font-medium">Fully Paid</span>
            </p>
          )}
        </div>

        {/* Booking Summary Card */}
        <Card className="p-6 shadow-lg border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-[#0080FF]" size={24} />
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-[#1E3A5F]">
                {booking.package?.name || 'Package'}
              </h2>
              <p className="text-sm text-gray-600">
                Created: {formatDate(booking.createdAt)}
              </p>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Price</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Paid</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(booking.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Outstanding</p>
              <p className={`text-lg font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(outstandingAmount)}
              </p>
            </div>
          </div>
        </Card>

        {/* Payment Status Messages */}
        {isCancelled && (
          <Card className="p-6 bg-red-50 border-red-200 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-600" size={20} />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Booking Cancelled</h3>
                <p className="text-sm text-red-800">This booking has been cancelled and cannot be paid.</p>
              </div>
            </div>
          </Card>
        )}

        {isFullyPaid && !isCancelled && (
          <Card className="p-6 bg-green-50 border-green-200 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="text-green-600" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 mb-1">Payment Complete</h3>
                <p className="text-sm text-green-800">
                  This booking has been fully paid. No further payment is required.
                </p>
                {booking.paymentStatus === 'paid' && (
                  <p className="text-xs text-green-700 mt-1">
                    Payment Status: <span className="font-semibold">Paid</span> • 
                    Amount Paid: <span className="font-semibold">{formatCurrency(booking.paidAmount || 0)}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link href={`/bookings/${booking.reference}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Booking Details
                </Button>
              </Link>
              <Link href="/dashboard/parent" className="flex-1">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Payment Form - Only show if there's outstanding amount and booking is not cancelled */}
        {!isFullyPaid && !isCancelled && outstandingAmount > 0 && (
          <Card className="p-6 shadow-lg border border-gray-200">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-[#1E3A5F] mb-2 flex items-center gap-2">
                <CreditCard className="text-[#0080FF]" size={20} />
                Payment Details
              </h2>
              <p className="text-sm text-gray-600">
                Pay the outstanding amount of <span className="font-semibold">{formatCurrency(outstandingAmount)}</span> to confirm your booking.
              </p>
            </div>

            <PaymentForm
              bookingId={booking.id}
              amount={outstandingAmount}
              onPaymentComplete={handlePaymentComplete}
              onPaymentFailed={handlePaymentFailed}
              disabled={paymentStatus === 'processing' || paymentStatus === 'completed'}
              externalPaymentStatus={paymentStatus}
            />

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Lock className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-xs text-blue-900">
                  <p className="font-semibold mb-1">Secure Payment</p>
                  <p>Your payment is processed securely through Stripe. We never store your card details.</p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <Link href={`/bookings/${booking.reference}`}>
            <Button variant="outline" className="w-full">
              Back to Booking Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPageClient;

