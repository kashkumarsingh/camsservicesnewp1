'use client';

import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

/**
 * Toast Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Standardized toast notifications for user feedback
 * Location: frontend/src/components/ui/Toast/Toast.tsx
 * 
 * Features:
 * - Success, error, warning, info variants
 * - Auto-dismiss after 5 seconds
 * - Optional action button
 * - Accessible (ARIA labels)
 */
export default function ToastComponent({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600',
  };

  const Icon = icons[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[500px]
        ${colors[toast.type]}
        animate-in slide-in-from-top-5 fade-in duration-300
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon size={20} className={`flex-shrink-0 mt-0.5 ${iconColors[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 hover:opacity-70 transition-opacity"
        aria-label="Dismiss notification"
      >
        <X size={16} className={iconColors[toast.type]} />
      </button>
    </div>
  );
}
