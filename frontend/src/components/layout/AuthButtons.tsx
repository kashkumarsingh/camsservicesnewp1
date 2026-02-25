'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { useRouter } from 'next/navigation';
import { getDashboardRoute } from '@/utils/navigation';
import { ROUTES } from '@/utils/routes';

interface AuthButtonsProps {
  isMobile?: boolean;
  /** When true, styles for use on dark header: white Login link with icon, pill Register. */
  variant?: 'default' | 'dark';
}

const AuthButtons: React.FC<AuthButtonsProps> = ({ isMobile = false, variant = 'default' }) => {
  const pathname = usePathname();
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();
  const isRegisterPage = pathname === ROUTES.REGISTER;

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isDarkHeader = variant === 'dark' && !isMobile;

  // Mobile: full-width blocks (mobile menu is white now)
  const mobileBaseClasses = 'block w-full text-center text-base font-medium py-3 px-4 rounded-lg transition-colors';
  const mobilePrimaryClasses = 'bg-[var(--color-primary)] text-white hover:opacity-90';
  const mobileSecondaryClasses = 'text-slate-700 hover:bg-slate-100';
  const mobileDestructiveClasses = 'text-slate-700 hover:bg-red-50 hover:text-red-600';

  // Desktop: default (light header) – Login = text link, Register = solid button
  const desktopLinkClasses = 'text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap flex items-center gap-2';
  const desktopPrimaryClasses = 'inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold bg-[var(--color-primary)] text-white hover:opacity-95 transition-opacity';
  const desktopSecondaryClasses = 'text-sm font-medium text-slate-600 hover:text-slate-900 flex items-center gap-2';
  const desktopDestructiveClasses = 'text-sm font-medium text-slate-600 hover:text-red-600 flex items-center gap-2';

  // Desktop dark header: Login = pill (white text + arrow, or outline on register page), Register = pill teal or solid primary when active
  const darkHeaderLoginClasses = isRegisterPage
    ? 'inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap'
    : 'inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-medium text-white hover:text-white/90 transition-colors whitespace-nowrap';
  const darkHeaderRegisterClasses = isRegisterPage
    ? 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-primary-blue text-white hover:opacity-95 transition-opacity'
    : 'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-light-blue-cyan text-white hover:opacity-95 transition-opacity';

  if (authLoading) {
    return (
      <span className={`text-sm ${isDarkHeader ? 'text-white/70' : 'text-slate-400'}`}>Loading…</span>
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
        href={ROUTES.LOGIN}
        className={
          isMobile
            ? `${mobileBaseClasses} ${mobileSecondaryClasses}`
            : isDarkHeader
              ? darkHeaderLoginClasses
              : desktopLinkClasses
        }
      >
        {isDarkHeader ? (
          <>
            <LogIn size={16} aria-hidden />
            Login
          </>
        ) : (
          <>
            <LogIn size={16} />
            Login
          </>
        )}
      </Link>
      <Link
        href={ROUTES.REGISTER}
        className={
          isMobile
            ? `${mobileBaseClasses} ${mobilePrimaryClasses}`
            : isDarkHeader
              ? darkHeaderRegisterClasses
              : desktopPrimaryClasses
        }
      >
        Register
      </Link>
    </div>
  );
};

export default AuthButtons;
