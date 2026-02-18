'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDate } from '@/utils/formatDate';
import { ApiPaymentService } from '@/infrastructure/services/payment/ApiPaymentService';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import {
  Calendar,
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  XCircle,
  Hourglass,
  Info,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button';

interface BookingDetailPageClientProps {
  reference: string;
}

const BookingDetailPageClient: React.FC<BookingDetailPageClientProps> = ({ reference }) => {
  const router = useRouter();
  const { booking, loading, error, refetch } = useBooking(undefined, reference);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return {
          label: 'Confirmed',
          className: 'bg-green-100 text-green-800 border-green-200',
          icon: CheckCircle,
          iconColor: 'text-green-600',
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: Hourglass,
          iconColor: 'text-yellow-600',
        };
      case 'draft':
        return {
          label: 'Draft',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Info,
          iconColor: 'text-blue-600',
        };
      case 'cancelled':
      case 'canceled':
        return {
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
          icon: XCircle,
          iconColor: 'text-red-600',
        };
      case 'completed':
        return {
          label: 'Completed',
          className: 'bg-purple-100 text-purple-800 border-purple-200',
          icon: CheckCircle,
          iconColor: 'text-purple-600',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: Info,
          iconColor: 'text-gray-600',
        };
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          label: 'Paid',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'partial':
        return {
          label: 'Partial Payment',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'pending':
        return {
          label: 'Pending Payment',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'failed':
        return {
          label: 'Payment Failed',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      case 'refunded':
        return {
          label: 'Refunded',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
      default:
        return {
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const statusBadge = getStatusBadge(booking.status);
  const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
  const StatusIcon = statusBadge.icon;
  const outstandingAmount = booking.outstandingAmount || booking.totalPrice - booking.paidAmount;

  // Check if payment status needs refresh
  const needsPaymentRefresh = (booking.status === 'draft' || booking.paymentStatus === 'pending') && 
                              booking.paidAmount === 0 && 
                              booking.payments && booking.payments.length > 0;

  const handleRefreshPaymentStatus = async () => {
    if (refreshing) return;

    setRefreshing(true);
    setRefreshError(null);

    try {
      // Use the refresh endpoint which checks all payments for the booking
      const response = await apiClient.post<{
        success: boolean;
        message?: string;
        data?: any;
      }>(
        API_ENDPOINTS.BOOKING_REFRESH_PAYMENT(booking.id),
        {}
      );
      
      if (response.data?.success) {
        // Success - refresh booking data
        await refetch();
        setRefreshError(null);
      } else {
        setRefreshError(response.data?.message || 'Failed to refresh payment status');
      }
    } catch (error: any) {
      console.error('Error refreshing payment status:', error);
      setRefreshError(error.message || 'Failed to refresh payment status');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard/parent" className="inline-flex items-center gap-2 text-[#0080FF] hover:text-[#0066CC] mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <h1 className="text-3xl font-heading font-bold text-[#1E3A5F] mb-2">Booking Details</h1>
          <p className="text-gray-600">Reference: <span className="font-mono font-semibold">{booking.reference}</span></p>
        </div>

        {/* Main Booking Card */}
        <Card className="p-8 shadow-lg border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Package className="text-[#0080FF]" size={24} />
                <h2 className="text-2xl font-semibold text-[#1E3A5F]">
                  {booking.package?.name || 'Package'}
                </h2>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                Created: {formatDate(booking.createdAt)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}
              >
                <StatusIcon className={`w-3.5 h-3.5 ${statusBadge.iconColor}`} />
                {statusBadge.label}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${paymentBadge.className}`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                Payment: {paymentBadge.label}
              </span>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <div>
              <p className="text-xs text-gray-600 mb-1">Total Price</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Paid</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(booking.paidAmount)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Outstanding</p>
              <p className={`text-xl font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                {formatCurrency(outstandingAmount)}
              </p>
            </div>
          </div>

          {/* Package Details */}
          {booking.package && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Package Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 font-medium mb-1">{booking.package.name}</p>
                {booking.package.slug && (
                  <Link
                    href={`/packages/${booking.package.slug}`}
                    className="text-sm text-[#0080FF] hover:text-[#0066CC] inline-flex items-center gap-1"
                  >
                    View Package Details
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Participants */}
          {booking.participants && booking.participants.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Participants ({booking.participants.length})
              </h3>
              <div className="space-y-3">
                {booking.participants.map((participant, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-gray-900">
                        {participant.firstName} {participant.lastName}
                      </p>
                      {participant.dateOfBirth && (
                        <p className="text-sm text-gray-600">
                          DOB: {formatDate(participant.dateOfBirth)}
                        </p>
                      )}
                    </div>
                    {participant.medicalInfo && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Medical Info:</span> {participant.medicalInfo}
                      </p>
                    )}
                    {participant.specialNeeds && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Special Needs:</span> {participant.specialNeeds}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Parent/Guardian Information */}
          {booking.parentGuardian && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Parent/Guardian Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {/* Handle optional parentGuardian - use fallback fields if not present */}
                {(() => {
                  const parentGuardian = booking.parentGuardian || {
                    firstName: booking.parentFirstName || '',
                    lastName: booking.parentLastName || '',
                    email: booking.parentEmail || '',
                    phone: booking.parentPhone || '',
                    address: booking.parentAddress,
                    postcode: booking.parentPostcode,
                    county: booking.parentCounty,
                    emergencyContact: booking.emergencyContact,
                  };
                  
                  return (
                    <>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-900">
                          {parentGuardian.firstName} {parentGuardian.lastName}
                        </span>
                      </div>
                      {parentGuardian.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">{parentGuardian.email}</span>
                        </div>
                      )}
                      {parentGuardian.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">{parentGuardian.phone}</span>
                        </div>
                      )}
                      {parentGuardian.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                          <div className="text-gray-900">
                            <p>{parentGuardian.address}</p>
                            {parentGuardian.postcode && (
                              <p>{parentGuardian.postcode}</p>
                            )}
                            {parentGuardian.county && (
                              <p>{parentGuardian.county}</p>
                            )}
                          </div>
                        </div>
                      )}
                      {parentGuardian.emergencyContact && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-900">
                            <span className="font-medium">Emergency:</span> {parentGuardian.emergencyContact}
                          </span>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Schedules */}
          {booking.schedules && booking.schedules.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Schedule ({booking.schedules.length} session{booking.schedules.length !== 1 ? 's' : ''})
              </h3>
              <div className="space-y-3">
                {booking.schedules.map((schedule, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {formatDate(schedule.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        {schedule.startTime} - {schedule.endTime}
                      </div>
                    </div>
                    {schedule.trainerId && (
                      <p className="text-sm text-gray-600 mb-1">
                        Trainer ID: {schedule.trainerId}
                      </p>
                    )}
                    {schedule.activities && schedule.activities.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-gray-600 mb-1">Activities:</p>
                        <div className="flex flex-wrap gap-2">
                          {schedule.activities.map((activity, actIndex) => (
                            <span
                              key={actIndex}
                              className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                            >
                              {activity.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-[#1E3A5F] mb-3 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Notes
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Cancellation Info */}
          {booking.cancelledAt && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Cancellation Information
              </h3>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Cancelled on: {formatDate(booking.cancelledAt)}</p>
                {booking.cancellationReason && (
                  <p className="text-gray-900">{booking.cancellationReason}</p>
                )}
              </div>
            </div>
          )}

          {/* Payment Status Refresh Alert */}
          {needsPaymentRefresh && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-900 mb-1">
                    Payment Processing
                  </p>
                  <p className="text-xs text-amber-800 mb-3">
                    We received your payment, but it's still being processed. This usually takes just a few moments. Click the button below to check if your payment has been confirmed.
                  </p>
                  <Button
                    onClick={handleRefreshPaymentStatus}
                    disabled={refreshing}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {refreshing ? 'Checking...' : 'Check Payment Status'}
                  </Button>
                  {refreshError && (
                    <p className="text-xs text-red-600 mt-2">{refreshError}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
            {outstandingAmount > 0 && booking.status !== 'cancelled' && booking.status !== 'canceled' && (
              <Link href={`/bookings/${booking.reference}/payment`} className="flex-1">
                <Button className="w-full flex items-center justify-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Pay Outstanding ({formatCurrency(outstandingAmount)})
                </Button>
              </Link>
            )}
            <Link href="/dashboard/parent" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BookingDetailPageClient;

