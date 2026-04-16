/**
 * Performance Measurement Error Fix
 *
 * Suppresses Next.js performance.measure errors when a mark has a negative
 * timestamp (e.g. PolicyPage, HMR in development, or redirect-only pages).
 * Patch runs at module load on the client so it is active before any
 * framework code calls performance.measure.
 *
 * Usage: Import and render in root layout so this module loads for all routes.
 */

'use client';

function applyPerformancePatch(): void {
  if (typeof performance === 'undefined' || typeof performance.measure !== 'function') return;

  const originalMeasure = performance.measure.bind(performance);
  performance.measure = function (name: string, startMark?: string, endMark?: string): PerformanceMeasure {
    try {
      if (startMark && !performance.getEntriesByName(startMark, 'mark').length) {
        return {} as PerformanceMeasure;
      }
      if (endMark && !performance.getEntriesByName(endMark, 'mark').length) {
        return {} as PerformanceMeasure;
      }
      return originalMeasure(name, startMark, endMark);
    } catch (error: unknown) {
      const msg = (error as { message?: string })?.message ?? '';
      if (
        msg.includes('negative time stamp') ||
        msg.includes('cannot have a negative') ||
        msg.includes('Failed to execute') ||
        msg.includes('measure')
      ) {
        return {} as PerformanceMeasure;
      }
      throw error;
    }
  };

  const originalMark = performance.mark.bind(performance);
  performance.mark = function (name: string, options?: PerformanceMarkOptions): PerformanceMark {
    try {
      return originalMark(name, options);
    } catch (error: unknown) {
      if ((error as { message?: string })?.message?.includes('mark')) {
        return {} as PerformanceMark;
      }
      throw error;
    }
  };
}

// Run as soon as this module is evaluated on the client (before any component mount)
if (typeof window !== 'undefined') {
  applyPerformancePatch();
}

export default function PerformanceFix() {
  return null;
}

