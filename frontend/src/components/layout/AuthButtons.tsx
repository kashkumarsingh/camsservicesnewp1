'use client';

import React from 'react';
import Link from 'next/link';
import { LogIn, User, LogOut } from 'lucide-react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { getDashboardRoute } from '@/utils/navigation';

interface AuthButtonsProps {
  isMobile?: boolean;
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile = false }) => {
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Mobile: full-width blocks (mobile menu is white now)
  const mobileBaseClasses = 'block w-full text-center text-base font-medium py-3 px-4 rounded-lg transition-colors';
  const mobilePrimaryClasses = 'bg-[var(--color-primary)] text-white hover:opacity-90';
  const mobileSecondaryClasses = 'text-slate-700 hover:bg-slate-100';
  const mobileDestructiveClasses = 'text-slate-700 hover:bg-red-50 hover:text-red-600';

  // Desktop: Payhawk-style – Login = text link, primary action = one solid button
  const desktopLinkClasses = 'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-2';
  const desktopPrimaryClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold bg-[var(--color-primary)] text-white hover:opacity-95 transition-opacity';
  const desktopSecondaryClasses = 'text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2';
  const desktopDestructiveClasses = 'text-sm font-medium text-slate-600 hover:text-red-600 flex items-center gap-2';

  if (authLoading) {
    return (
      <span className="text-sm text-slate-400">Loading…</span>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-4'}>
        <Link
          href={getDashboardRoute(user)}
          className={isMobile ? `${mobileBaseClasses} ${mobilePrimaryClasses}` : desktopPrimaryClasses}
        >
          <User size={isMobile ? 20 : 16} />
          Dashboard
        </Link>
        {isMobile ? (
          <button onClick={handleLogout} className={`${mobileBaseClasses} ${mobileDestructiveClasses}`}>
            <LogOut size={20} />
            Logout
          </button>
        ) : (
          <button onClick={handleLogout} className={desktopDestructiveClasses}>
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-4'}>
      <Link
        href="/login"
        className={isMobile ? `${mobileBaseClasses} ${mobileSecondaryClasses}` : desktopLinkClasses}
      >
        <LogIn size={isMobile ? 20 : 16} />
        Login
      </Link>
      <Link
        href="/register"
        className={isMobile ? `${mobileBaseClasses} ${mobilePrimaryClasses}` : desktopPrimaryClasses}
      >
        Register
      </Link>
    </div>
  );
};

export default AuthButtons;
