'use client';

import React from 'react';
import moment from 'moment';
import { CheckCircle, Package } from 'lucide-react';
import { formatHours } from '@/utils/formatHours';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface BookingSummaryProps {
  booking: BookingDTO;
  packageName?: string;
  totalHours?: number;
}

/**
 * Booking Summary Component
 * Displays a clear summary matching the ConfirmationStep format:
 * - Child name
 * - Date
 * - Pickup/Event/Drop-off times (if available)
 * - Hours used/remaining
 */
export function BookingSummary({ booking, packageName, totalHours }: BookingSummaryProps) {
  const firstParticipant = booking.participants[0];
  const childName = firstParticipant 
    ? `${firstParticipant.firstName} ${firstParticipant.lastName}`.trim()
    : 'Your child';
  
  const firstSchedule = booking.schedules[0];
  const bookingDate = firstSchedule?.date 
    ? moment(firstSchedule.date).format('ddd, MMM D, YYYY')
    : booking.startDate 
    ? moment(booking.startDate).format('ddd, MMM D, YYYY')
    : 'TBD';

  // Calculate hours used and remaining
  const calculatedTotalHours = totalHours || booking.totalHours;
  const usedHours = booking.schedules.reduce((sum, schedule) => {
    if (schedule.startTime && schedule.endTime) {
      const start = moment(schedule.startTime, 'HH:mm');
      const end = moment(schedule.endTime, 'HH:mm');
      const duration = end.diff(start, 'hours', true);
      return sum + duration;
    }
    return sum;
  }, 0);
  const remainingHours = Math.max(0, calculatedTotalHours - usedHours);

  const formatTime = (timeString?: string) => {
    if (!timeString) return 'TBD';
    return moment(timeString, 'HH:mm').format('h:mm A');
  };

  return (
    <div className="bg-white rounded-card shadow-card border-2 border-green-300 overflow-hidden">
      {/* Celebration Header */}
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <CheckCircle className="text-white" size={48} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Booking Confirmed! 🎉</h2>
          <p className="text-lg text-green-50">Welcome to the CAMS Family, {childName}!</p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        {/* Booking Reference */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-primary-blue flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-blue">Your Booking Reference</h3>
              <p className="text-xs text-gray-600">Save this number for your records</p>
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
            <div className="text-2xl md:text-3xl font-extrabold text-primary-blue font-mono tracking-wider text-center">
              {booking.reference}
            </div>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
          <h3 className="text-lg font-bold text-navy-blue mb-4">Booking Summary</h3>
          
          <div className="space-y-4">
            {/* Child & Date */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Child</div>
                  <div className="text-base font-semibold text-gray-900">{childName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-1">Date</div>
                  <div className="text-base font-semibold text-gray-900">{bookingDate}</div>
                </div>
              </div>
            </div>

            {/* Session Times */}
            {firstSchedule && (
              <div className="bg-white rounded-lg p-4 border border-purple-200">
                <div className="text-xs text-gray-600 mb-2">Session Times</div>
                <div className="space-y-2">
                  {firstSchedule.startTime && firstSchedule.endTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">Time:</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTime(firstSchedule.startTime)} - {formatTime(firstSchedule.endTime)}
                      </span>
                    </div>
                  )}
                  {booking.schedules.length > 1 && (
                    <div className="text-xs text-gray-600 mt-2">
                      + {booking.schedules.length - 1} more session{booking.schedules.length - 1 === 1 ? '' : 's'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hours Summary */}
            <div className="bg-white rounded-lg p-4 border border-purple-200">
              <div className="text-xs text-gray-600 mb-3">Package Hours</div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-extrabold text-primary-blue mb-1">
                    {formatHours(usedHours)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Used</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-green-600 mb-1">
                    {formatHours(remainingHours)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-extrabold text-purple-600 mb-1">
                    {formatHours(calculatedTotalHours)}
                  </div>
                  <div className="text-xs text-gray-600 font-medium">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {booking.paymentStatus === 'completed' && booking.paidAmount > 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-blue">Payment Confirmed</h3>
                <p className="text-xs text-gray-600">Your payment has been successfully processed</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Amount Paid:</span>
                <span className="text-lg font-bold text-green-700">
                  £{booking.paidAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Remaining Hours Notice */}
        {remainingHours > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-300 rounded-xl p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-blue flex items-center justify-center flex-shrink-0">
                <Package className="text-white" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-navy-blue mb-1">You Have Remaining Hours!</h3>
                <p className="text-sm text-gray-700">
                  You&apos;ve used <strong className="text-primary-blue">{formatHours(usedHours)}</strong> of your <strong>{formatHours(calculatedTotalHours)}</strong> package.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-xl p-5 border-2 border-blue-200">
              <div className="text-center">
                <div className="text-4xl font-extrabold text-primary-blue mb-2">{formatHours(remainingHours)}</div>
                <div className="text-base font-semibold text-gray-700">remaining hours available</div>
                <div className="text-xs text-gray-600 mt-1">You can book these hours now or later</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

