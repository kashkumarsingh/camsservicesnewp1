'use client';

import React from 'react';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';

interface BookingDetailProps {
  booking: BookingDTO;
}

/**
 * Booking Detail Component
 * Displays full details of a booking
 */
export function BookingDetail({ booking }: BookingDetailProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Booking {booking.reference}
            </h1>
            <p className="text-gray-500 mt-1">Package: {booking.packageSlug}</p>
          </div>
          <span
            className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
              booking.status
            )}`}
          >
            {booking.status}
          </span>
        </div>

        {/* Booking Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Booking Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Start Date:</span>
                <span className="text-gray-900 font-medium">
                  {formatDate(booking.startDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Hours:</span>
                <span className="text-gray-900 font-medium">{booking.totalHours}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sessions:</span>
                <span className="text-gray-900 font-medium">
                  {booking.schedules.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="text-gray-900 font-medium">
                  {formatDateTime(booking.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Price:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(booking.totalPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Paid Amount:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(booking.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Remaining:</span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(booking.totalPrice - booking.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Status:</span>
                <span className="text-gray-900 font-medium">{booking.paymentStatus}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Parent/Guardian Information */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Parent/Guardian</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            {/* Handle optional parentGuardian - use fallback fields if not present */}
            {(() => {
              const parentGuardian = booking.parentGuardian || {
                firstName: booking.parentFirstName || '',
                lastName: booking.parentLastName || '',
                email: booking.parentEmail || '',
                phone: booking.parentPhone || '',
              };
              return (
                <>
                  <p className="text-sm">
                    <span className="font-medium">{parentGuardian.firstName} {parentGuardian.lastName}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{parentGuardian.email}</p>
                  <p className="text-sm text-gray-600">{parentGuardian.phone}</p>
                </>
              );
            })()}
          </div>
        </div>

        {/* Participants */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Participants</h3>
          <div className="space-y-3">
            {booking.participants.map((participant, index) => {
              const dob = new Date(participant.dateOfBirth);
              const age = new Date().getFullYear() - dob.getFullYear();
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">
                    {participant.firstName} {participant.lastName}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Age: {age} years old
                  </p>
                  {participant.medicalInfo && (
                    <p className="text-sm text-gray-600 mt-1">
                      Medical Info: {participant.medicalInfo}
                    </p>
                  )}
                  {participant.specialNeeds && (
                    <p className="text-sm text-gray-600 mt-1">
                      Special Needs: {participant.specialNeeds}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedules */}
        <div className="mb-8">
          <h3 className="font-semibold text-gray-900 mb-3">Scheduled Sessions</h3>
          <div className="space-y-3">
            {booking.schedules.map((schedule, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      {formatDate(schedule.date)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                  {schedule.trainerId && (
                    <span className="text-xs text-gray-500">Trainer: {schedule.trainerId}</span>
                  )}
                </div>
                
                {/* Activities (if confirmed) */}
                {(schedule as any).activities && Array.isArray((schedule as any).activities) && (schedule as any).activities.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700 mb-2">Activities:</p>
                    <div className="space-y-2">
                      {(schedule as any).activities.map((activity: any, activityIndex: number) => (
                        <div key={activityIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{activity.name}</p>
                              {activity.description && (
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                              )}
                              {activity.notes && (
                                <p className="text-xs text-gray-500 italic mt-1">Notes: {activity.notes}</p>
                              )}
                              {activity.confirmed_at && (
                                <p className="text-xs text-gray-500 mt-2">
                                  Confirmed: {formatDateTime(activity.confirmed_at)}
                                </p>
                              )}
                            </div>
                            {activity.assignment_status === 'confirmed' && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                                Confirmed
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{booking.notes}</p>
            </div>
          </div>
        )}

        {/* Cancellation Info */}
        {booking.cancellationReason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-900 mb-2">Cancellation</h3>
            <p className="text-sm text-red-800">{booking.cancellationReason}</p>
            {booking.cancelledAt && (
              <p className="text-xs text-red-600 mt-2">
                Cancelled on: {formatDateTime(booking.cancelledAt)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


