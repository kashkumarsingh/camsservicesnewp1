/**
 * Performance Measurement Error Fix
 *
 * Suppresses Next.js performance.measure errors when a mark has a negative
 * timestamp (e.g. HMR in development, or redirect-only pages like
 * ParentBookingSessionsRedirect where the component name is used as a mark).
 *
 * Usage: Import and render in root layout so it runs for all routes.
 */

'use client';

import { useEffect } from 'react';

export default function PerformanceFix() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
      // Wrap performance.measure to catch and suppress negative timestamp errors
      const originalMeasure = performance.measure.bind(performance);
      
      performance.measure = function(name: string, startMark?: string, endMark?: string): PerformanceMeasure {
        try {
          // Check if marks exist before measuring
          if (startMark && !performance.getEntriesByName(startMark, 'mark').length) {
            // Mark doesn't exist - return empty measure to avoid error
            return {} as PerformanceMeasure;
          }
          if (endMark && !performance.getEntriesByName(endMark, 'mark').length) {
            // Mark doesn't exist - return empty measure to avoid error
            return {} as PerformanceMeasure;
          }
          
          return originalMeasure(name, startMark, endMark);
        } catch (error: any) {
          // Suppress "negative time stamp" errors during HMR/Fast Refresh
          if (
            error?.message?.includes('negative time stamp') ||
            error?.message?.includes('cannot have a negative') ||
            error?.message?.includes('Failed to execute') ||
            error?.message?.includes('measure')
          ) {
            // Silently suppress - framework timing quirk
            return {} as PerformanceMeasure;
          }
          throw error;
        }
      };
      
      // Also wrap performance.mark to ensure marks are valid
      const originalMark = performance.mark.bind(performance);
      performance.mark = function(name: string, options?: PerformanceMarkOptions): PerformanceMark {
        try {
          return originalMark(name, options);
        } catch (error: any) {
          // Suppress mark errors during HMR
          if (error?.message?.includes('mark')) {
            return {} as PerformanceMark;
          }
          throw error;
        }
      };
  }, []);

  return null; // This component doesn't render anything
}

