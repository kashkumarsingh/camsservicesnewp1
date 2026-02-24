'use client';

import React from 'react';
import Toast, { type Toast as ToastType } from './Toast';

interface ToastContainerProps {
  toasts: ToastType[];
  onDismiss: (id: string) => void;
}

/**
 * Toast Container Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Container for displaying multiple toast notifications
 * Location: frontend/src/components/ui/Toast/ToastContainer.tsx
 * 
 * Features:
 * - Fixed position (top-right)
 * - Stacked toasts
 * - Auto-dismiss
 */
export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-4 right-4 z-toast flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
