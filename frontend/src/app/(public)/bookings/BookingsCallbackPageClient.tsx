'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Calendar, 
  BookOpen, 
  Shield, 
  Clock,
  Home,
  Package,
  CheckCircle,
  CreditCard,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { formatCurrency } from '@/utils/currencyFormatter';
import { toastManager } from '@/utils/toast';

export default function BookingsCallbackPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'canceled' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [bookingReference, setBookingReference] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [hasSessions, setHasSessions] = useState<boolean>(false);
  const hasProcessedRef = useRef(false); // Prevent infinite loop

  // Fetch booking details when we have a reference (for canceled state)
  const { booking: canceledBooking, loading: loadingBooking } = useBooking(
    undefined,
    bookingReference || undefined
  );

  const confirmPaymentFromSession = useCallback(async (sessionId: string) => {
    if (hasProcessedRef.current) return; // Already processed
    
    hasProcessedRef.current = true;
    setStatus('loading');
    setMessage('Confirming your payment...');

    try {
      // Step 1: Get payment intent ID from session ID
      const endpoint = API_ENDPOINTS?.GET_PAYMENT_INTENT_FROM_SESSION || '/payments/get-intent-from-session';
      
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error('Payment intent endpoint is not available. Please check API_ENDPOINTS configuration.');
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[BookingsCallbackPageClient] Using endpoint:', endpoint);
      }
      
      const intentResponse = await apiClient.post<{ payment_intent_id: string }>(
        endpoint,
        { session_id: sessionId }
      );

      const paymentIntentId = intentResponse.data.payment_intent_id;

      if (!paymentIntentId) {
        throw new Error('Payment intent not found in session');
      }

      // Step 2: Confirm payment with backend
      const confirmResult = await ApiPaymentService.confirmPayment(paymentIntentId);

      if (!confirmResult.success) {
        throw new Error(confirmResult.error || 'Payment confirmation failed');
      }

      // Extract booking information
      if (confirmResult.booking) {
        setBookingReference(confirmResult.booking.reference || null);
        setBookingId(confirmResult.booking.id || null);
        // Check if booking has sessions (from API response)
        setHasSessions(confirmResult.booking.has_sessions === true || confirmResult.booking.schedules_count > 0);
      }

      // Success!
      setStatus('success');
      setMessage('Your payment was processed successfully! Your booking is now confirmed and ready to use.');
    } catch (error: any) {
      console.error('Failed to confirm payment:', error);
      // Even if confirmation fails, show success (webhook might have handled it)
      setStatus('success');
      setMessage("Your payment was processed successfully! If your booking status hasn't updated yet, it will update shortly. Please check your dashboard.");
    }
  }, []); // No dependencies to prevent recreation

  useEffect(() => {
    // Only process once
    if (hasProcessedRef.current) return;

    const paymentStatus = searchParams.get('payment');
    const sessionIdParam = searchParams.get('session_id');

    if (sessionIdParam) {
      setSessionId(sessionIdParam);
    }

    if (paymentStatus === 'success' && sessionIdParam) {
      // Confirm payment with backend
      confirmPaymentFromSession(sessionIdParam);
    } else if (paymentStatus === 'canceled') {
      hasProcessedRef.current = true;
      setStatus('canceled');
      setMessage('Payment was canceled. Your booking has been saved as a draft. You can complete the payment later from your dashboard.');
    } else if (paymentStatus === 'success' && !sessionIdParam) {
      // Success but no session ID - might have been confirmed already
      hasProcessedRef.current = true;
      setStatus('success');
      setMessage('Your payment was processed successfully! Your booking is now confirmed.');
    } else if (!paymentStatus) {
      // No payment status - might be direct navigation
      hasProcessedRef.current = true;
      setStatus('error');
      setMessage('Unable to determine payment status. Please check your dashboard for booking details.');
    }
  }, [searchParams, confirmPaymentFromSession]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-8 md:p-12 text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-32 bg-gradient-to-r from-[#0080FF] to-[#00D4FF] rounded-full opacity-20 animate-pulse"></div>
              </div>
              <Loader2 className="w-24 h-24 text-[#0080FF] animate-spin mx-auto relative z-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">Processing Your Payment</h1>
            <p className="text-lg text-gray-600 mb-6">Please wait while we confirm your payment status...</p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure payment processing</span>
            </div>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-300 overflow-hidden">
            {/* Celebration Header - Matching ConfirmationStep pattern */}
            <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-8 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}></div>
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <CheckCircle className="text-white" size={48} />
                </div>
                <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-2">Payment Successful! 🎉</h2>
                <p className="text-lg text-green-50">{message}</p>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Booking Reference - Matching ConfirmationStep pattern */}
              {bookingReference && (
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#0080FF] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1E3A5F]">Your Booking Reference</h3>
                      <p className="text-xs text-gray-600">Save this number for your records</p>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                    <div className="text-2xl md:text-3xl font-extrabold text-[#0080FF] font-mono tracking-wider text-center">
                      {bookingReference}
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(bookingReference);
                        toastManager.success('Booking reference copied to clipboard!');
                      }}
                      className="mt-3 w-full text-xs text-gray-600 hover:text-[#0080FF] font-semibold transition-colors"
                    >
                      📋 Click to copy
                    </button>
                  </div>
                </div>
              )}

              {/* What's Next Section */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-[#0080FF] flex items-center justify-center">
                    <CheckCircle className="text-white" size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#1E3A5F]">What Happens Next?</h3>
                    <p className="text-xs text-gray-600">Your journey with CAMS</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {!hasSessions ? (
                    <div className="flex gap-4 bg-white rounded-lg p-4 border-2 border-blue-300">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#0080FF] flex items-center justify-center">
                        <BookOpen className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1E3A5F] mb-1">📅 Book Your Sessions</div>
                        <div className="text-sm text-gray-600">
                          Schedule your activities now. You can book sessions anytime from your dashboard.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 bg-white rounded-lg p-4 border-2 border-green-300">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                        <CheckCircle className="text-white" size={20} />
                      </div>
                      <div>
                        <div className="font-semibold text-[#1E3A5F] mb-1">✅ Sessions Already Booked</div>
                        <div className="text-sm text-gray-600">
                          Your sessions are scheduled! View them in your dashboard.
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-4 bg-white rounded-lg p-4 border border-purple-200">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                      <Clock className="text-white" size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-[#1E3A5F] mb-1">📧 Confirmation Email</div>
                      <div className="text-sm text-gray-600">
                        A confirmation email with all details has been sent to your email address.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                {/* Primary Action */}
                {bookingId && !hasSessions && (
                  <Link 
                    href="/dashboard/parent" 
                    className="block"
                  >
                    <button
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-bold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-lg hover:shadow-xl"
                    >
                      <BookOpen size={20} />
                      Book Your Sessions Now
                      <span aria-hidden>→</span>
                    </button>
                  </Link>
                )}

                {/* Secondary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Link href="/dashboard/parent">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border-2 border-[#0080FF] text-[#0080FF] font-semibold hover:bg-blue-50 transition-all">
                      <Home size={18} />
                      Go to Dashboard
                    </button>
                  </Link>
                  <Link href="/packages">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-bold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-lg">
                      <Package size={18} />
                      Book Another Package
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canceled State - Recovery-Focused Design */}
        {status === 'canceled' && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-6 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-heading font-bold text-[#1E3A5F] mb-1">
                    Payment Incomplete
                  </h1>
                  <p className="text-sm text-gray-600">Your booking is ready to go!</p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8 space-y-6">
              {/* Booking Summary */}
              {loadingBooking ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">Loading booking details...</span>
                </div>
              ) : canceledBooking ? (
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {canceledBooking.package?.name || 'Package'}
                        </span>
                      </div>
                      {canceledBooking.participants && canceledBooking.participants.length > 0 && (() => {
                        const participant = canceledBooking.participants[0];
                        const childName = `${participant.firstName} ${participant.lastName}`.trim();
                        // Calculate age from dateOfBirth if available
                        let ageDisplay = '';
                        if (participant.dateOfBirth) {
                          try {
                            const dob = new Date(participant.dateOfBirth);
                            const today = new Date();
                            let age = today.getFullYear() - dob.getFullYear();
                            const monthDiff = today.getMonth() - dob.getMonth();
                            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                              age--;
                            }
                            ageDisplay = ` (Age ${age})`;
                          } catch {
                            // Invalid date, skip age
                          }
                        }
                        return (
                          <div className="text-sm text-gray-600">
                            For: {childName}{ageDisplay}
                          </div>
                        );
                      })()}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-[#0080FF]">
                        {formatCurrency(canceledBooking.totalPrice || 0)}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    Booking details will be available once payment is completed.
                  </div>
                </div>
              )}

              {/* Recovery Message */}
              <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
                <p className="text-base text-gray-700 leading-relaxed">
                  Your booking is ready to go! Complete your payment whenever you're ready. Your booking will be confirmed as soon as payment is received.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {canceledBooking?.reference ? (
                  <Link 
                    href={`/bookings/${canceledBooking.reference}/payment`}
                    className="flex-1"
                  >
                    <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-semibold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-md hover:shadow-lg">
                      <CreditCard size={18} />
                      Complete Payment
                      <span aria-hidden>→</span>
                    </button>
                  </Link>
                ) : (
                  <Link href="/dashboard/parent" className="flex-1">
                    <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-semibold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-md hover:shadow-lg">
                      <CreditCard size={18} />
                      Complete Payment
                      <span aria-hidden>→</span>
                    </button>
                  </Link>
                )}
                <Link href="/dashboard/parent" className="flex-1">
                  <button className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all">
                    <Home size={18} />
                    Go to Dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-red-300 p-8 md:p-12 text-center">
            <div className="mb-6">
              <div className="bg-red-100 rounded-full p-4 inline-block">
                <XCircle className="w-20 h-20 text-red-600" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">Payment Status Unknown</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">{message}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/parent">
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-bold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-lg hover:shadow-xl">
                  <Home size={18} />
                  Go to Dashboard
                  <span aria-hidden>→</span>
                </button>
              </Link>
              <Link href="/packages">
                <button className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-gradient-to-r from-[#0080FF] to-[#00D4FF] text-white font-bold hover:from-[#0069cc] hover:to-[#00b8e6] transition-all shadow-lg">
                  <Package size={18} />
                  Book a Package
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

