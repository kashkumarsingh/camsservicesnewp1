/**
 * useSiteSettings Hook
 * 
 * Client-side hook for fetching site settings from the API.
 * Used in client components that need site settings data.
 */

'use client';

import { useState, useEffect } from 'react';
import { SiteSettingsDTO } from '@/core/application/siteSettings/dto/SiteSettingsDTO';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/** Ensures the base URL ends with /api/v1 so requests hit Laravel's API routes. */
function ensureApiV1Base(base: string): string {
  const trimmed = base.replace(/\/$/, '');
  if (trimmed.endsWith('/api/v1')) {
    return trimmed;
  }
  return `${trimmed}/api/v1`;
}

const getApiBase = (): string => {
  if (typeof window !== 'undefined' && typeof process !== 'undefined' && process.env) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
    if (apiUrl) {
      return ensureApiV1Base(apiUrl);
    }
  }
  
  // Runtime fallback: Detect environment
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    // Local development: localhost, 127.0.0.1, or local IP
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('10.') || hostname.startsWith('172.')) {
      return 'http://localhost:9080/api/v1';
    }
    // Production (Vercel etc.): backend on Railway
    return 'https://cams-backend-production-759f.up.railway.app/api/v1';
  }
  
  // Default: localhost for development
  return 'http://localhost:9080/api/v1';
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Resolve API URL at runtime, not at module load time
        const apiBase = getApiBase();
        const siteSettingsUrl = `${apiBase}${API_ENDPOINTS.SITE_SETTINGS}`;

        const response = await fetch(siteSettingsUrl, {
          headers: {
            Accept: 'application/json',
          },
          cache: 'no-store', // Always fetch fresh data on client
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch site settings: ${response.statusText}`);
        }

        const payload = await response.json();
        const dto = (payload.data ?? payload) as SiteSettingsDTO;
        setSettings(dto);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load site settings'));
        // Don't set settings to null on error - keep previous value if available
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return { settings, loading, error };
}

