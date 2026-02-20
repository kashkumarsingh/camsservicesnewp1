'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Package,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Info,
  XCircle,
  ExternalLink,
  RefreshCw,
  CheckCircle,
  Hourglass,
  AlertCircle,
} from 'lucide-react';
import Card from '@/components/ui/Card/Card';
import Button from '@/components/ui/Button';
import {
  BOOKING_DETAIL_FINANCIAL,
  BOOKING_DETAIL_SECTIONS,
  BOOKING_DETAIL_PAYMENT_REFRESH,
  BOOKING_DETAIL_ACTIONS,
} from './constants';
import type { BookingDetailMainCardProps } from './bookingDetailTypes';
import { ROUTES } from '@/utils/routes';

function getStatusIcon(status: string): React.ComponentType<{ className?: string }> {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'completed':
      return CheckCircle;
    case 'pending':
      return Hourglass;
    case 'draft':
      return Info;
    case 'cancelled':
    case 'canceled':
      return XCircle;
    default:
      return Info;
  }
}

const BookingDetailMainCard: React.FC<BookingDetailMainCardProps> = ({
  booking,
  statusLabel,
  paymentLabel,
  statusBadgeClassName,
  paymentBadgeClassName,
  outstandingAmount,
  needsPaymentRefresh,
  refreshing,
  refreshError,
  onRefreshPayment,
  payOutstandingHref,
  payOutstandingLabel,
  backToDashboardHref,
  formatCurrency,
  formatDate,
}) => {
  const StatusIcon = getStatusIcon(booking.status);

  const parentGuardian = booking.parentGuardian ?? {
    firstName: booking.parentFirstName ?? '',
    lastName: booking.parentLastName ?? '',
    email: booking.parentEmail ?? '',
    phone: booking.parentPhone ?? '',
    address: booking.parentAddress,
    postcode: booking.parentPostcode,
    county: booking.parentCounty,
    emergencyContact: booking.emergencyContact,
  };

  const hasParentData =
    parentGuardian.firstName ||
    parentGuardian.lastName ||
    parentGuardian.email ||
    parentGuardian.phone;

  return (
    <Card className="p-8 shadow-lg border border-gray-200 mb-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <Package className="text-primary-blue" size={24} />
            <h2 className="text-2xl font-semibold text-navy-blue">
              {booking.package?.name ?? 'Package'}
            </h2>
          </div>
          <p className="text-gray-600 text-sm mb-2">Created: {formatDate(booking.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${statusBadgeClassName}`}
          >
            <StatusIcon className="w-3.5 h-3.5" />
            {statusLabel}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${paymentBadgeClassName}`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Payment: {paymentLabel}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6">
        <div>
          <p className="text-xs text-gray-600 mb-1">{BOOKING_DETAIL_FINANCIAL.totalPrice}</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(booking.totalPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">{BOOKING_DETAIL_FINANCIAL.paid}</p>
          <p className="text-xl font-bold text-green-600">{formatCurrency(booking.paidAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">{BOOKING_DETAIL_FINANCIAL.outstanding}</p>
          <p
            className={`text-xl font-bold ${outstandingAmount > 0 ? 'text-red-600' : 'text-gray-900'}`}
          >
            {formatCurrency(outstandingAmount)}
          </p>
        </div>
      </div>

      {booking.package && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-blue mb-3 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.packageInfo}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 font-medium mb-1">{booking.package.name}</p>
            {booking.package.slug && (
              <Link
                href={ROUTES.PACKAGE_BY_SLUG(booking.package.slug)}
                className="text-sm text-primary-blue hover:text-primary-blue/90 inline-flex items-center gap-1"
              >
                {BOOKING_DETAIL_SECTIONS.viewPackageDetails}
                <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      )}

      {booking.participants && booking.participants.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-blue mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.participants(booking.participants.length)}
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
                      {BOOKING_DETAIL_SECTIONS.dob} {formatDate(participant.dateOfBirth)}
                    </p>
                  )}
                </div>
                {participant.medicalInfo && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{BOOKING_DETAIL_SECTIONS.medicalInfo}</span>{' '}
                    {participant.medicalInfo}
                  </p>
                )}
                {participant.specialNeeds && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{BOOKING_DETAIL_SECTIONS.specialNeeds}</span>{' '}
                    {participant.specialNeeds}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {hasParentData && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-blue mb-3 flex items-center gap-2">
            <User className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.parentGuardian}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
                  {parentGuardian.postcode && <p>{parentGuardian.postcode}</p>}
                  {parentGuardian.county && <p>{parentGuardian.county}</p>}
                </div>
              </div>
            )}
            {parentGuardian.emergencyContact && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">
                  <span className="font-medium">{BOOKING_DETAIL_SECTIONS.emergency}</span>{' '}
                  {parentGuardian.emergencyContact}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {booking.schedules && booking.schedules.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-blue mb-3 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.schedule(booking.schedules.length)}
          </h3>
          <div className="space-y-3">
            {booking.schedules.map((schedule, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{formatDate(schedule.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    {schedule.startTime} - {schedule.endTime}
                  </div>
                </div>
                {schedule.trainerId && (
                  <p className="text-sm text-gray-600 mb-1">
                    {BOOKING_DETAIL_SECTIONS.trainerId} {schedule.trainerId}
                  </p>
                )}
                {schedule.activities && schedule.activities.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600 mb-1">
                      {BOOKING_DETAIL_SECTIONS.activities}
                    </p>
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

      {booking.notes && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-navy-blue mb-3 flex items-center gap-2">
            <Info className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.notes}
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-900 whitespace-pre-wrap">{booking.notes}</p>
          </div>
        </div>
      )}

      {booking.cancelledAt && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            {BOOKING_DETAIL_SECTIONS.cancellation}
          </h3>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">
              {BOOKING_DETAIL_SECTIONS.cancelledOn} {formatDate(booking.cancelledAt)}
            </p>
            {booking.cancellationReason && (
              <p className="text-gray-900">{booking.cancellationReason}</p>
            )}
          </div>
        </div>
      )}

      {needsPaymentRefresh && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-600 flex-shrink-0 mt-0.5" size={20} />
            <div className="flex-1">
              <p className="text-sm font-medium text-amber-900 mb-1">
                {BOOKING_DETAIL_PAYMENT_REFRESH.title}
              </p>
              <p className="text-xs text-amber-800 mb-3">
                {BOOKING_DETAIL_PAYMENT_REFRESH.description}
              </p>
              <Button
                onClick={onRefreshPayment}
                disabled={refreshing}
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing
                  ? BOOKING_DETAIL_PAYMENT_REFRESH.buttonChecking
                  : BOOKING_DETAIL_PAYMENT_REFRESH.buttonCheck}
              </Button>
              {refreshError && <p className="text-xs text-red-600 mt-2">{refreshError}</p>}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
        {outstandingAmount > 0 &&
          booking.status !== 'cancelled' &&
          booking.status !== 'canceled' && (
            <Link href={payOutstandingHref} className="flex-1">
              <Button className="w-full flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                {payOutstandingLabel}
              </Button>
            </Link>
          )}
        <Link href={backToDashboardHref} className="flex-1">
          <Button variant="outline" className="w-full">
            {BOOKING_DETAIL_ACTIONS.backToDashboard}
          </Button>
        </Link>
      </div>
    </Card>
  );
};

export default BookingDetailMainCard;
