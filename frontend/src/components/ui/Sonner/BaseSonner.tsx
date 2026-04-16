'use client';

import { Toaster } from 'sonner';
import { SONNER_TOAST_DURATION_MS } from '@/shared/utils/appConstants';

/**
 * Base Sonner toaster with app-wide defaults.
 * Renders at top-center; extend via sonner's toast() from notificationSonner or elsewhere.
 * Single instance in dashboard layout so notification toasts and other sonner calls use the same container.
 */
export function BaseSonner() {
  return (
    <Toaster
      position="top-center"
      duration={SONNER_TOAST_DURATION_MS}
      richColors
      closeButton
      theme="system"
      toastOptions={{
        className: 'z-toast',
      }}
    />
  );
}
