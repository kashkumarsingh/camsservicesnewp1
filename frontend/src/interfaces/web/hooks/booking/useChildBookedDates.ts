'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Hook to fetch booked dates for a specific child
 * 
 * Clean Architecture: Interface Layer (Web Hook)
 * Purpose: Fetches dates that are already booked for a child across all their bookings
 * Location: frontend/src/interfaces/web/hooks/booking/useChildBookedDates.ts
 */
export function useChildBookedDates(childId: number | null) {
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookedDates = useCallback(async () => {
    if (!childId) {
      setBookedDates([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the endpoint constant, with fallback to direct string if undefined (build cache issue)
      let endpoint: string;
      
      if (API_ENDPOINTS?.CHILD_BOOKED_DATES && typeof API_ENDPOINTS.CHILD_BOOKED_DATES === 'function') {
        endpoint = API_ENDPOINTS.CHILD_BOOKED_DATES(childId);
      } else {
        endpoint = `/children/${childId}/booked-dates`;
      }
      
      // Ensure endpoint is a valid string
      if (!endpoint || typeof endpoint !== 'string') {
        throw new Error(`Booked dates endpoint is not available for child ${childId}. Please check API_ENDPOINTS configuration.`);
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[useChildBookedDates] Fetching booked dates for child ${childId} using endpoint:`, endpoint);
      }
      
      const response = await apiClient.get<{
        child_id: string;
        booked_dates: string[];
        count?: number;
      }>(endpoint);

      // ApiClient unwraps the 'data' field from backend's success response
      // So response.data is the actual data object
      const bookedDates = response.data?.booked_dates || [];
      setBookedDates(bookedDates);
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[useChildBookedDates] Fetched ${bookedDates.length} booked dates for child ${childId}:`, bookedDates);
      }
    } catch (err: any) {
      // Don't show error to user if it's a 404 (route might not be available yet or child doesn't exist)
      // Just log it and return empty array
      if (err.response?.status === 404) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useChildBookedDates] Endpoint not found (404) for child ${childId}. This might be expected if the route is not yet deployed or the child doesn't exist.`);
        }
        setBookedDates([]);
        setError(null); // Don't show error for 404
      } else {
        // Only log errors for non-404 cases
        console.error('Failed to fetch booked dates for child:', err);
        setError(err.message || 'Failed to load booked dates');
        setBookedDates([]);
      }
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => {
    fetchBookedDates();
  }, [fetchBookedDates]);

  return {
    bookedDates,
    loading,
    error,
    refetch: fetchBookedDates,
  };
}

