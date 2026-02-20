'use client';

/**
 * My Bookings Component
 * 
 * Clean Architecture Layer: Presentation (UI Components)
 * Purpose: Displays user's purchased packages/bookings
 * 
 * Features:
 * - Lists all bookings for authenticated user
 * - Shows package name, status, payment status, and outstanding amount
 * - Links to booking detail pages
 * - Responsive design with proper loading and error states
 * - Accessibility compliant (WCAG 2.1 AA)
 */

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';
import { ROUTES } from '@/utils/routes';
import {
  Calendar,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  CreditCard,
  ExternalLink,
  Loader2,
  Hourglass,
  Users,
  CalendarClock,
  AlertTriangle,
  Repeat,
} from 'lucide-react';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import Button from '@/components/ui/Button';
import { formatHours } from '@/utils/formatHours';
import moment from 'moment';

interface MyBookingsProps {
  bookings: BookingDTO[];
  loading?: boolean;
  error?: string | null;
}

const MyBookings: React.FC<MyBookingsProps> = ({ bookings, loading, error }) => {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return {
          icon: CheckCircle2,
          label: 'Confirmed',
          className: 'bg-green-100 text-green-800 border-green-200',
          iconColor: 'text-green-600',
        };
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          iconColor: 'text-yellow-600',
        };
      case 'draft':
        return {
          icon: AlertCircle,
          label: 'Draft',
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          label: 'Cancelled',
          className: 'bg-red-100 text-red-800 border-red-200',
          iconColor: 'text-red-600',
        };
      default:
        return {
          icon: AlertCircle,
          label: status,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
          iconColor: 'text-gray-600',
        };
    }
  };

  const getPaymentStatusBadge = (paymentStatus: string) => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return {
          label: 'Paid',
          className: 'bg-green-100 text-green-800 border-green-200',
        };
      case 'partial':
        return {
          label: 'Partial',
          className: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'pending':
        return {
          label: 'Pending',
          className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
      case 'failed':
        return {
          label: 'Failed',
          className: 'bg-red-100 text-red-800 border-red-200',
        };
      default:
        return {
          label: paymentStatus,
          className: 'bg-gray-100 text-gray-800 border-gray-200',
        };
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDateLong = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Calculate expiry status and days remaining
  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) {
      return {
        status: 'no-expiry' as const,
        daysRemaining: null,
        label: 'No expiry set',
        className: 'bg-gray-100 text-gray-800 border-gray-200',
        iconColor: 'text-gray-600',
        isExpired: false,
        isExpiringSoon: false,
      };
    }

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = daysRemaining < 0;
    const isExpiringSoon = daysRemaining >= 0 && daysRemaining <= 14;

    if (isExpired) {
      return {
        status: 'expired' as const,
        daysRemaining,
        label: `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} ago`,
        className: 'bg-red-100 text-red-800 border-red-200',
        iconColor: 'text-red-600',
        isExpired: true,
        isExpiringSoon: false,
      };
    }

    if (isExpiringSoon) {
      return {
        status: 'expiring-soon' as const,
        daysRemaining,
        label: `Expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
        className: 'bg-amber-100 text-amber-800 border-amber-200',
        iconColor: 'text-amber-600',
        isExpired: false,
        isExpiringSoon: true,
      };
    }

    return {
      status: 'valid' as const,
      daysRemaining,
      label: `Expires ${formatDateLong(expiresAt)}`,
      className: 'bg-green-100 text-green-800 border-green-200',
      iconColor: 'text-green-600',
      isExpired: false,
      isExpiringSoon: false,
    };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-card p-8 shadow-lg border border-gray-200">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-primary-blue animate-spin" />
          <span className="ml-3 text-gray-600">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  // Only show error state if there's an error AND no bookings
  // If bookings exist despite an error, show them with a warning
  if (error && bookings.length === 0) {
    return (
      <div className="bg-white rounded-card p-8 shadow-lg border border-gray-200">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Bookings</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0 && !error) {
    return (
      <div className="bg-white rounded-card p-8 shadow-lg border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-heading font-bold text-navy-blue">My Bookings</h2>
        </div>
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{EMPTY_STATE.NO_BOOKINGS_YET_HEADING.title}</h3>
          <p className="text-gray-600 mb-6">
            {EMPTY_STATE.NO_BOOKINGS_YET.message}
          </p>
          <Link href={ROUTES.PACKAGES}>
            <Button>Browse Packages</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-card p-8 shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-navy-blue">My Bookings</h2>
        <Link href={ROUTES.PACKAGES}>
          <Button variant="outline" size="sm">
            Book Another Package
          </Button>
        </Link>
      </div>

      {/* Warning banner if there was an error but bookings still loaded */}
      {error && bookings.length > 0 && (
        <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> There was an issue loading some bookings, but we've shown what we could retrieve. ({error})
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {bookings.map((booking) => {
          const statusBadge = getStatusBadge(booking.status);
          const paymentBadge = getPaymentStatusBadge(booking.paymentStatus);
          const StatusIcon = statusBadge.icon;
          const packageName = booking.package?.name || 'Package';
          const outstandingAmount = booking.outstandingAmount ?? (booking.totalPrice - booking.paidAmount - (booking.discountAmount || 0));
          const isDeleted = (booking as any).isDeleted || false;
          
          // Calculate booked hours and remaining hours from schedules (Pay First → Book Later flow)
          const bookedHours = (() => {
            if (!booking.schedules || booking.schedules.length === 0) return 0;
            return booking.schedules.reduce((sum, schedule) => {
              if (schedule.durationHours) {
                return sum + schedule.durationHours;
              }
              // Fallback: calculate from start/end time
              const start = moment(`${schedule.date} ${schedule.startTime}`, 'YYYY-MM-DD HH:mm');
              const end = moment(`${schedule.date} ${schedule.endTime}`, 'YYYY-MM-DD HH:mm');
              return sum + end.diff(start, 'hours', true);
            }, 0);
          })();
          
          const remainingHours = Math.max(0, booking.totalHours - bookedHours);
          const sessionCount = booking.schedules?.length || 0;
          const hasSessions = sessionCount > 0;
          const needsSessionsBooked = booking.paymentStatus === 'paid' && booking.status === 'confirmed' && !hasSessions;
          const expiryStatus = getExpiryStatus(booking.packageExpiresAt);

          return (
            <div
              key={booking.id}
              className={`border-2 rounded-lg p-6 transition-colors ${
                isDeleted 
                  ? 'border-red-300 bg-red-50 opacity-75' 
                  : 'border-gray-200 hover:border-primary-blue/50'
              }`}
            >
              {isDeleted && (
                <div className="mb-4 p-3 bg-red-100 border-2 border-red-300 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <p className="text-sm font-semibold text-red-800">
                      This booking has been deleted
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <Package className="w-5 h-5 text-primary-blue flex-shrink-0" />
                    <h3 className="text-xl font-semibold text-navy-blue truncate">
                      {packageName}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Booking Reference</p>
                      <p className="font-mono text-sm font-semibold text-gray-900">
                        {booking.reference}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-1">Created</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(booking.createdAt)}
                      </p>
                    </div>

                    {/* Package Expiry Date */}
                    {(() => {
                      const expiryStatus = getExpiryStatus(booking.packageExpiresAt);
                      return (
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Package Expires</p>
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-semibold ${
                              expiryStatus.isExpired ? 'text-red-700' :
                              expiryStatus.isExpiringSoon ? 'text-amber-700' :
                              'text-gray-900'
                            }`}>
                              {booking.packageExpiresAt ? formatDate(booking.packageExpiresAt) : 'No expiry set'}
                            </p>
                            {expiryStatus.isExpired && (
                              <AlertTriangle className="w-4 h-4 text-red-600" />
                            )}
                            {expiryStatus.isExpiringSoon && !expiryStatus.isExpired && (
                              <AlertTriangle className="w-4 h-4 text-amber-600" />
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Display associated children */}
                  {booking.participants && booking.participants.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Associated Child(ren)</p>
                      <div className="flex flex-wrap gap-2">
                        {booking.participants.map((participant, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200"
                          >
                            <Users className="w-3.5 h-3.5" />
                            {participant.firstName} {participant.lastName}
                            {participant.childId && (
                              <span className="text-blue-600">(ID: {participant.childId})</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mb-4">
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

                    {booking.totalHours > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatHours(bookedHours)}/{formatHours(booking.totalHours)}h
                        {remainingHours > 0 && (
                          <span className="ml-1 text-blue-600">({formatHours(remainingHours)}h left)</span>
                        )}
                      </span>
                    )}
                    {sessionCount > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        <Clock className="w-3.5 h-3.5" />
                        {sessionCount} session{sessionCount !== 1 ? 's' : ''}
                      </span>
                    )}
                    {needsSessionsBooked && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                        <Hourglass className="w-3.5 h-3.5" />
                        Book Sessions
                      </span>
                    )}
                    {/* Expiry Status Badge */}
                    {booking.packageExpiresAt && (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${expiryStatus.className}`}>
                        <CalendarClock className={`w-3.5 h-3.5 ${expiryStatus.iconColor}`} />
                        {expiryStatus.label}
                      </span>
                    )}
                  </div>

                  {/* Expiry Warning Banner */}
                  {expiryStatus.isExpired && (
                    <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-red-900 mb-1">
                            Package Expired
                          </p>
                          <p className="text-xs text-red-700">
                            This package expired on {formatDateLong(booking.packageExpiresAt!)}. 
                            {remainingHours > 0 && (
                              <> You have {formatHours(remainingHours)} unused hours. Please contact us if you need assistance.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Expiring Soon Warning Banner */}
                  {expiryStatus.isExpiringSoon && !expiryStatus.isExpired && (
                    <div className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-1">
                            Package Expiring Soon
                          </p>
                          <p className="text-xs text-amber-700">
                            This package expires on {formatDateLong(booking.packageExpiresAt!)} ({expiryStatus.daysRemaining} day{expiryStatus.daysRemaining !== 1 ? 's' : ''} remaining). 
                            {remainingHours > 0 && (
                              <> Book your remaining {formatHours(remainingHours)} hours soon to avoid losing them.</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Pay First → Book Later: Show session booking status */}
                  {needsSessionsBooked && (
                    <div className="mb-4 bg-amber-50 border-2 border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Hourglass className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-amber-900 mb-1">
                            Ready to Book Sessions
                          </p>
                          <p className="text-xs text-amber-700">
                            Your payment is complete. Book your {formatHours(booking.totalHours)} hours of sessions now.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Total Price</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(booking.totalPrice)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Paid</p>
                      <p className="text-lg font-semibold text-green-600">
                        {formatCurrency(booking.paidAmount)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-1">Outstanding</p>
                      <p className={`text-lg font-semibold ${outstandingAmount > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                        {formatCurrency(Math.max(0, outstandingAmount))}
                      </p>
                    </div>
                  </div>
                  
                  {/* Session Progress (Pay First → Book Later) */}
                  {booking.paymentStatus === 'paid' && booking.totalHours > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                          Session Progress
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatHours(bookedHours)} / {formatHours(booking.totalHours)} hours
                        </p>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary-blue to-light-blue-cyan h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${booking.totalHours > 0 ? (bookedHours / booking.totalHours) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link href={`/bookings/${booking.reference}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      View Details
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </Link>
                  {booking.paymentStatus === 'paid' && booking.status === 'confirmed' && (
                    <Link href="/dashboard/parent">
                      <Button
                        size="sm"
                        className="flex items-center gap-2 bg-gradient-to-r from-primary-blue to-light-blue-cyan hover:from-primary-blue/90 hover:to-light-blue-cyan/90"
                      >
                        <Calendar className="w-4 h-4" />
                        {booking.schedules && booking.schedules.length > 0
                          ? 'Manage Sessions'
                          : 'Book Sessions'}
                      </Button>
                    </Link>
                  )}
                  {outstandingAmount > 0 && booking.status !== 'cancelled' && (
                    <Link href={`/bookings/${booking.reference}/payment`}>
                      <Button size="sm" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Pay Now
                      </Button>
                    </Link>
                  )}
                  {/* Buy Again - Show for completed/expired bookings */}
                  {booking.packageSlug && (booking.status === 'confirmed' || expiryStatus.isExpired) && (
                    <Link href={`/book/${booking.packageSlug}${booking.participants?.[0]?.childId ? `?childId=${booking.participants[0].childId}` : ''}`}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex items-center gap-2 border-primary-blue text-primary-blue hover:bg-primary-blue hover:text-white"
                      >
                        <Repeat className="w-4 h-4" />
                        Buy Again
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;

