/**
 * Toast Notification Utility
 * 
 * Clean Architecture: Infrastructure/Utils Layer
 * Purpose: Centralized toast notification management
 * Location: frontend/src/utils/toast.ts
 * 
 * Usage:
 * ```tsx
 * import { showToast } from '@/utils/toast';
 * 
 * showToast.success('Session booked successfully!');
 * showToast.error('Failed to book session. Please try again.');
 * ```
 */

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

type ToastListener = (toast: Toast) => void;

class ToastManager {
  private listeners: ToastListener[] = [];
  private idCounter = 0;

  subscribe(listener: ToastListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify(toast: Toast) {
    this.listeners.forEach(listener => listener(toast));
  }

  private generateId(): string {
    this.idCounter += 1;
    return `toast-${Date.now()}-${this.idCounter}`;
  }

  success(message: string, action?: { label: string; onClick: () => void }) {
    this.notify({
      id: this.generateId(),
      type: 'success',
      message,
      action,
    });
  }

  error(message: string, action?: { label: string; onClick: () => void }) {
    this.notify({
      id: this.generateId(),
      type: 'error',
      message,
      action,
    });
  }

  warning(message: string, action?: { label: string; onClick: () => void }) {
    this.notify({
      id: this.generateId(),
      type: 'warning',
      message,
      action,
    });
  }

  info(message: string, action?: { label: string; onClick: () => void }) {
    this.notify({
      id: this.generateId(),
      type: 'info',
      message,
      action,
    });
  }
}

export const toastManager = new ToastManager();

// Convenience function for React components
export const showToast = {
  success: (message: string, action?: { label: string; onClick: () => void }) => {
    toastManager.success(message, action);
  },
  error: (message: string, action?: { label: string; onClick: () => void }) => {
    toastManager.error(message, action);
  },
  warning: (message: string, action?: { label: string; onClick: () => void }) => {
    toastManager.warning(message, action);
  },
  info: (message: string, action?: { label: string; onClick: () => void }) => {
    toastManager.info(message, action);
  },
};
