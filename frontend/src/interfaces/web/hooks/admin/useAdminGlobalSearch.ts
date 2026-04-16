/**
 * useAdminGlobalSearch — admin global quick search (parents, children, trainers, bookings).
 */

import { useState, useCallback, useRef } from 'react';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { apiClient } from '@/infrastructure/http/ApiClient';

export interface AdminSearchParent {
  id: string;
  name: string;
  email: string;
}

export interface AdminSearchChild {
  id: string;
  name: string;
  parentName?: string;
}

export interface AdminSearchTrainer {
  id: string;
  name: string;
}

export interface AdminSearchBooking {
  id: string;
  reference: string;
  status: string;
}

export interface AdminSearchResult {
  parents: AdminSearchParent[];
  children: AdminSearchChild[];
  trainers: AdminSearchTrainer[];
  bookings: AdminSearchBooking[];
}

export function useAdminGlobalSearch() {
  const [result, setResult] = useState<AdminSearchResult>({
    parents: [],
    children: [],
    trainers: [],
    bookings: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (query: string) => {
    const q = typeof query === 'string' ? query.trim() : '';
    if (q === '') {
      setResult({ parents: [], children: [], trainers: [], bookings: [] });
      setError(null);
      return;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);
    try {
      const url = `${API_ENDPOINTS.ADMIN_SEARCH}?q=${encodeURIComponent(q)}`;
      const response = await apiClient.get<AdminSearchResult>(url, {
        signal: abortRef.current.signal,
      });
      const data = response.data ?? {};
      setResult({
        parents: Array.isArray(data.parents) ? data.parents : [],
        children: Array.isArray(data.children) ? data.children : [],
        trainers: Array.isArray(data.trainers) ? data.trainers : [],
        bookings: Array.isArray(data.bookings) ? data.bookings : [],
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setResult({ parents: [], children: [], trainers: [], bookings: [] });
      setError('Search failed');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, []);

  return { result, isLoading, error, search };
}
