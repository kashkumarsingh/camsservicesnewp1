'use client';

import React from 'react';
import { BookingDTO } from '@/core/application/booking/dto/BookingDTO';
import { BookingCard } from './BookingCard';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface BookingListProps {
  bookings: BookingDTO[];
  loading?: boolean;
  error?: string | null;
}

/**
 * Booking List Component
 * Displays a list of bookings
 */
export function BookingList({ bookings, loading, error }: BookingListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{EMPTY_STATE.NO_BOOKINGS_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </div>
  );
}


