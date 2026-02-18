'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookingRetrievalForm from '@/components/booking/forms/BookingRetrievalForm';
import PackageBookingFlow from '@/components/features/packages/PackageBookingFlow';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { bookingDTOToVisitorBooking, VisitorBooking } from '@/interfaces/web/utils/bookingRetrievalAdapter';

export default function RetrieveBookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [retrievedBooking, setRetrievedBooking] = useState<VisitorBooking | null>(null);
  const [packageSlug, setPackageSlug] = useState<string | null>(null);
  const [referenceFromUrl, setReferenceFromUrl] = useState<string | null>(null);

  // Get reference from URL
  const reference = searchParams.get('reference');
  
  // Use booking domain hook to fetch booking by reference
  const { booking, loading, error } = useBooking(undefined, reference || undefined);

  // Check for reference in URL and fetch booking
  useEffect(() => {
    if (reference) {
      setReferenceFromUrl(reference);
    }
  }, [reference]);

  // Convert BookingDTO to VisitorBooking when booking is loaded
  useEffect(() => {
    if (booking) {
      try {
        const visitorBooking = bookingDTOToVisitorBooking(booking);
        setRetrievedBooking(visitorBooking);
        setPackageSlug(visitorBooking.packageSlug || null);
      } catch (err) {
        console.error('Error converting booking:', err);
      }
    }
  }, [booking]);

  // Fallback to localStorage if API booking not found (for backward compatibility)
  useEffect(() => {
    if (reference && !booking && !loading && !error) {
      try {
        const storedData = 
          typeof window !== 'undefined' 
            ? (window.localStorage.getItem('cams_booking_' + reference) ||
               window.sessionStorage.getItem('cams_booking_' + reference))
            : null;
        
        if (storedData) {
          const booking: VisitorBooking = JSON.parse(storedData);
          setRetrievedBooking(booking);
          setPackageSlug(booking.packageSlug || null);
        }
      } catch (err) {
        console.error('Error loading booking from storage:', err);
      }
    }
  }, [reference, booking, loading, error]);

  const handleBookingRetrieved = (booking: VisitorBooking) => {
    setRetrievedBooking(booking);
    setPackageSlug(booking.packageSlug || null);
  };

  // If we have a booking and package slug, show the booking flow
  if (retrievedBooking && packageSlug) {
    return (
      <PackageBookingFlow
        packageSlug={packageSlug}
        initialBookingReference={retrievedBooking.reference}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <BookingRetrievalForm 
          onBookingRetrieved={handleBookingRetrieved}
          initialReference={referenceFromUrl}
        />
        {loading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-blue-900">Loading booking...</p>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-900 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

