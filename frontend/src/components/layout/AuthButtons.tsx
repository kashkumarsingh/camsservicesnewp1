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

  // Mobile: full-width blocks – design system theme colours (no slate)
  const mobileBaseClasses = 'block w-full text-center text-base font-medium py-3 px-4 rounded-form-button transition-colors flex items-center justify-center gap-2';
  const mobilePrimaryClasses = 'bg-primary-blue text-white hover:opacity-90';
  const mobileSecondaryClasses = 'text-navy-blue hover:bg-primary-blue/10 border-2 border-primary-blue/30';
  const mobileDestructiveClasses = 'text-navy-blue border-2 border-primary-blue/30 hover:bg-primary-blue/10 hover:border-primary-blue/50';

  // Desktop: default (light header) – theme colours
  const desktopLinkClasses = 'text-sm font-medium text-navy-blue hover:text-primary-blue transition-colors whitespace-nowrap flex items-center gap-2';
  const desktopPrimaryClasses = 'inline-flex items-center justify-center px-5 py-2.5 rounded-header-button text-sm font-semibold bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white hover:opacity-95 transition-opacity shadow-md';
  const desktopSecondaryClasses = 'text-sm font-medium text-navy-blue hover:text-primary-blue flex items-center gap-2';
  const desktopDestructiveClasses = 'text-sm font-medium text-navy-blue hover:text-red-600 flex items-center gap-2 rounded-header-button px-4 py-2.5 border-2 border-navy-blue/30 hover:border-primary-blue/50 hover:bg-primary-blue/5';

  // Desktop dark header: design system pills (rounded-header-button, theme colours)
  const darkHeaderLoginClasses = isRegisterPage
    ? 'inline-flex items-center justify-center gap-1.5 rounded-header-button border-2 border-white px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors whitespace-nowrap'
    : 'inline-flex items-center justify-center gap-1.5 rounded-header-button px-5 py-2.5 text-sm font-medium text-white hover:text-white/90 transition-colors whitespace-nowrap';
  const darkHeaderRegisterClasses = isRegisterPage
    ? 'inline-flex items-center justify-center rounded-header-button px-5 py-2.5 text-sm font-semibold bg-primary-blue text-white hover:opacity-95 transition-opacity'
    : 'inline-flex items-center justify-center rounded-header-button px-5 py-2.5 text-sm font-semibold bg-light-blue-cyan text-white hover:opacity-95 transition-opacity';
  const darkHeaderDashboardClasses = 'inline-flex items-center justify-center gap-1.5 rounded-header-button px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white hover:opacity-95 transition-opacity whitespace-nowrap shadow-md';
  const darkHeaderLogoutClasses = 'inline-flex items-center justify-center gap-1.5 rounded-header-button border-2 border-white/50 px-4 py-2.5 text-sm font-medium text-white hover:bg-white/10 hover:border-white/70 transition-colors whitespace-nowrap';

  if (authLoading) {
    return (
      <span className={`text-sm ${isDarkHeader ? 'text-white/70' : 'text-navy-blue/60'}`}>Loading…</span>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className={isMobile ? 'flex flex-col gap-2' : 'flex items-center gap-3'}>
        <Link
          href={getDashboardRoute(user)}
          className={isMobile ? `${mobileBaseClasses} ${mobilePrimaryClasses}` : (isDarkHeader ? darkHeaderDashboardClasses : desktopPrimaryClasses)}
        >
          <User size={isMobile ? 20 : 16} aria-hidden />
          Dashboard
        </Link>
        {isMobile ? (
          <button type="button" onClick={handleLogout} className={`${mobileBaseClasses} ${mobileDestructiveClasses}`}>
            <LogOut size={20} aria-hidden />
            Logout
          </button>
        ) : (
          <button type="button" onClick={handleLogout} className={isDarkHeader ? darkHeaderLogoutClasses : desktopDestructiveClasses}>
            <LogOut size={16} aria-hidden />
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
