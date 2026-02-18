'use client';

import React, { useState, useEffect } from 'react';
import { Search, AlertCircle, CheckCircle2, Calendar, Clock, Package, Users } from 'lucide-react';
import Button from '@/components/ui/Button/Button';
import { formatHours } from '@/utils/formatHours';
import { useBooking } from '@/interfaces/web/hooks/booking/useBooking';
import { bookingDTOToVisitorBooking } from '@/interfaces/web/utils/bookingRetrievalAdapter';

interface VisitorBooking {
  reference: string;
  email: string;
  phone: string;
  usedHours: number;
  remainingHours: number;
  totalHours: number;
  sessions: number;
  date: string;
  sessionsData?: any[];
  parentDetails?: any;
  childrenDetails?: any[];
  packageName?: string;
  packageSlug?: string;
}

interface BookingRetrievalFormProps {
  onBookingRetrieved: (booking: VisitorBooking) => void;
  initialReference?: string | null;
}

const BookingRetrievalForm: React.FC<BookingRetrievalFormProps> = ({ onBookingRetrieved, initialReference = null }) => {
  const [reference, setReference] = useState(initialReference || '');
  const [searching, setSearching] = useState(false);
  const [foundBooking, setFoundBooking] = useState<VisitorBooking | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [allBookings, setAllBookings] = useState<VisitorBooking[]>([]);
  const [searchReference, setSearchReference] = useState<string | null>(null);
  
  // Use booking domain hook to fetch booking by reference
  const { booking, loading: apiLoading, error: apiError } = useBooking(undefined, searchReference || undefined);

  // Load all bookings from storage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const bookings: VisitorBooking[] = [];
        
        // Check localStorage (persists across sessions)
        for (let i = 0; i < window.localStorage.length; i++) {
          const key = window.localStorage.key(i);
          if (key && key.startsWith('cams_booking_')) {
            try {
              const data = JSON.parse(window.localStorage.getItem(key) || '{}');
              if (data.reference) {
                bookings.push(data);
              }
            } catch {}
          }
        }
        
        // Check sessionStorage (current session only)
        for (let i = 0; i < window.sessionStorage.length; i++) {
          const key = window.sessionStorage.key(i);
          if (key && key.startsWith('cams_booking_')) {
            try {
              const data = JSON.parse(window.sessionStorage.getItem(key) || '{}');
              if (data.reference && !bookings.find(b => b.reference === data.reference)) {
                bookings.push(data);
              }
            } catch {}
          }
        }
        
        // Sort by date (newest first)
        bookings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setAllBookings(bookings);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    }
  }, []);

  // Auto-search if initial reference provided
  useEffect(() => {
    if (initialReference && reference === initialReference) {
      handleSearch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialReference]);

  // Handle API booking response
  useEffect(() => {
    if (booking && searchReference) {
      try {
        const visitorBooking = bookingDTOToVisitorBooking(booking);
        setFoundBooking(visitorBooking);
        setError(null);
        setSearching(false);
      } catch (err) {
        console.error('Error converting booking:', err);
        setError('Error processing booking data. Please try again.');
        setSearching(false);
      }
    }
  }, [booking, searchReference]);

  // Handle API errors
  useEffect(() => {
    if (apiError && searchReference && !apiLoading) {
      // Fallback to localStorage if API fails
      const localStorageKey = 'cams_booking_' + searchReference.trim();
      const sessionStorageKey = 'cams_booking_' + searchReference.trim();
      const storedData = 
        typeof window !== 'undefined'
          ? (window.localStorage.getItem(localStorageKey) ||
             window.sessionStorage.getItem(sessionStorageKey))
          : null;
      
      if (storedData) {
        try {
          const booking: VisitorBooking = JSON.parse(storedData);
          setFoundBooking(booking);
          setError(null);
        } catch (err) {
          setError('Booking reference not found. Please check your reference number or contact us.');
        }
      } else {
        setError('Booking reference not found. Please check your reference number or contact us.');
      }
      setSearching(false);
    }
  }, [apiError, apiLoading, searchReference]);

  const handleSearch = () => {
    if (!reference.trim()) {
      setError('Please enter a booking reference');
      return;
    }

    setSearching(true);
    setError(null);
    setFoundBooking(null);

    const ref = reference.trim();

    // First, try to fetch from API using booking domain
    setSearchReference(ref);

    // Also check localStorage/sessionStorage as fallback (for backward compatibility)
    try {
      const localStorageKey = 'cams_booking_' + ref;
      const localStorageData = window.localStorage.getItem(localStorageKey);
      
      const sessionStorageKey = 'cams_booking_' + ref;
      const sessionStorageData = window.sessionStorage.getItem(sessionStorageKey);
      
      const storedData = localStorageData || sessionStorageData;
      
      if (storedData) {
        // If API fails, we'll use this as fallback (handled in useEffect)
        // For now, just store it for potential fallback
      }
    } catch (err) {
      console.error('Error checking storage:', err);
    }
  };

  const handleContinueBooking = () => {
    if (foundBooking) {
      onBookingRetrieved(foundBooking);
    }
  };

  const handleSelectRecentBooking = (booking: VisitorBooking) => {
    setReference(booking.reference);
    setFoundBooking(booking);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl border-2 border-gray-200 p-6 md:p-8 shadow-lg">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0080FF] to-[#00D4FF] flex items-center justify-center mx-auto mb-4">
          <Search className="text-white" size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-[#1E3A5F] mb-2">
          Retrieve Your Booking
        </h2>
        <p className="text-gray-600">
          Enter your booking reference to continue using your remaining hours
        </p>
      </div>

      {/* Search Form */}
      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1">
            <label htmlFor="reference" className="block text-sm font-semibold text-gray-700 mb-2">
              Booking Reference
            </label>
            <input
              id="reference"
              type="text"
              value={reference}
              onChange={(e) => {
                setReference(e.target.value.toUpperCase());
                setError(null);
                setFoundBooking(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="CAMS-XXXXXX-XXX-XXXX"
              className="w-full px-4 py-3 text-lg font-mono border-2 border-gray-300 rounded-lg focus:border-[#0080FF] focus:outline-none focus:ring-2 focus:ring-[#0080FF]/20 transition-all"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSearch}
              disabled={searching || apiLoading || !reference.trim()}
              className="px-6 py-3 bg-[#0080FF] hover:bg-[#0069cc] text-white font-semibold"
            >
              {searching || apiLoading ? 'Searching...' : 'Search'}
            </Button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-red-900 mb-1">Booking Not Found</p>
            <p className="text-sm text-red-800">{error}</p>
            <p className="text-xs text-red-700 mt-2">
              Need help? <a href="/contact" className="underline font-semibold">Contact us</a> with your booking reference.
            </p>
          </div>
        </div>
      )}

      {/* Found Booking Details */}
      {foundBooking && (
        <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 rounded-xl">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="text-white" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-1">Booking Found!</h3>
              <p className="text-sm text-green-800">
                Reference: <span className="font-mono font-semibold">{foundBooking.reference}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Package className="text-[#0080FF]" size={18} />
                <span className="text-xs font-semibold text-gray-600 uppercase">Package Hours</span>
              </div>
              <div className="text-2xl font-bold text-[#1E3A5F]">
                {formatHours(foundBooking.totalHours)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="text-green-600" size={18} />
                <span className="text-xs font-semibold text-gray-600 uppercase">Remaining Hours</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatHours(foundBooking.remainingHours)}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="text-amber-600" size={18} />
                <span className="text-xs font-semibold text-gray-600 uppercase">Sessions Booked</span>
              </div>
              <div className="text-2xl font-bold text-amber-600">
                {foundBooking.sessions}
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-600" size={18} />
                <span className="text-xs font-semibold text-gray-600 uppercase">Contact</span>
              </div>
              <div className="text-sm font-semibold text-[#1E3A5F]">
                {foundBooking.email}
              </div>
            </div>
          </div>

          {foundBooking.remainingHours > 0 && (
            <div className="mt-4">
              <Button
                onClick={handleContinueBooking}
                className="w-full bg-gradient-to-r from-[#0080FF] to-[#00D4FF] hover:from-[#0069cc] hover:to-[#00b8e6] text-white font-bold py-3 shadow-lg"
              >
                Continue Booking with {formatHours(foundBooking.remainingHours)} Remaining
              </Button>
            </div>
          )}

          {foundBooking.remainingHours <= 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                All hours have been used. <a href="/packages" className="underline font-semibold">Book a new package</a> to continue.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Bookings (if any) */}
      {allBookings.length > 0 && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-bold text-[#1E3A5F] mb-4">Recent Bookings</h3>
          <div className="space-y-2">
            {allBookings.slice(0, 5).map((booking) => (
              <button
                key={booking.reference}
                onClick={() => handleSelectRecentBooking(booking)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-semibold text-[#0080FF]">{booking.reference}</div>
                    <div className="text-xs text-gray-600 mt-1">
                      {formatHours(booking.usedHours)} used • {formatHours(booking.remainingHours)} remaining
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(booking.date).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingRetrievalForm;

