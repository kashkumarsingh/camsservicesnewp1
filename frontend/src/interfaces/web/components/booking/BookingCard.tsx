'use client';

import React from 'react';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import Link from 'next/link';

interface BookingCardProps {
  booking: BookingDTO;
}

/**
 * Booking Card Component
 * Displays a summary of a booking
 */
export function BookingCard({ booking }: BookingCardProps) {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
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
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Booking {booking.reference}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Package: {booking.packageSlug}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Start Date:</span>
          <span className="text-gray-900 font-medium">
            {formatDate(booking.startDate)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Hours:</span>
          <span className="text-gray-900 font-medium">{booking.totalHours}h</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total Price:</span>
          <span className="text-gray-900 font-medium">
            {formatCurrency(booking.totalPrice)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Payment Status:</span>
          <span className="text-gray-900 font-medium">{booking.paymentStatus}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Participants:</span>
          <span className="text-gray-900 font-medium">
            {booking.participants.length}
          </span>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <Link
          href={`/bookings/${booking.reference}`}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}


