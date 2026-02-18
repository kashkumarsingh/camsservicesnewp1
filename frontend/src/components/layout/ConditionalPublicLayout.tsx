'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import ToastContainer from '@/components/ui/Toast/ToastContainer';
import { toastManager, type Toast } from '@/utils/toast';

const PUBLIC_MAIN_CLASS =
  'pb-[48px] bg-white dark:bg-[hsl(240,10%,7%)] text-gray-900 dark:text-gray-100';

/**
 * Renders the public site chrome (Header, main) only when the current
 * route is NOT under /dashboard. Dashboard routes use their own shell and
 * should not show the marketing header, avoiding a duplicate header.
 * ToastContainer is included for public routes so toastManager works site-wide.
 */
export default function ConditionalPublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDashboard = pathname != null && pathname.startsWith('/dashboard');
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const unsubscribe = toastManager.subscribe((toast) => {
      setToasts((prev) => [...prev, toast]);
    });
    return unsubscribe;
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  if (isDashboard) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main className={PUBLIC_MAIN_CLASS}>{children}</main>
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}
