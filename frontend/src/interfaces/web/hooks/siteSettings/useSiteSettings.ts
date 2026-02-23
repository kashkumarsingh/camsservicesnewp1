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
import { getApiBaseUrl } from '@/infrastructure/http/apiBaseUrl';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettingsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiBase = getApiBaseUrl({ serverSide: false });
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

