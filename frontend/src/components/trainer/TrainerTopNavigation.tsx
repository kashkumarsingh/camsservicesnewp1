'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import { ROUTES } from '@/utils/routes';

interface TrainerTopNavigationProps {
  /** Callback when back arrow is clicked */
  onBackClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when logout is clicked */
  onLogoutClick?: () => void;
}

/**
 * Trainer Top Navigation Component
 * 
 * Clean Architecture: Presentation Layer (UI Component)
 * Purpose: Dark blue navigation bar for trainers dashboard
 * Matches specification: Dark blue (#2C5F8D), white text, logo, menu items, action buttons
 */
export default function TrainerTopNavigation({
  onBackClick,
  onSettingsClick,
  onLogoutClick,
}: TrainerTopNavigationProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (onLogoutClick) {
      onLogoutClick();
    } else {
      await logout();
      router.push('/');
    }
  };

  const navLinks = [
    { href: ROUTES.ABOUT, label: 'Who We Are' },
    { href: ROUTES.SERVICES, label: 'What We Do' },
    { href: ROUTES.PACKAGES, label: 'Our Packages' },
    { href: ROUTES.BLOG, label: 'Blog' },
    { href: ROUTES.CONTACT, label: "Let's Connect" },
    { href: ROUTES.DASHBOARD_TRAINER, label: 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-header h-16 w-full border-b border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo and Back Arrow */}
          <div className="flex items-center gap-4">
            {onBackClick && (
              <button
                onClick={onBackClick}
                className="rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Go back"
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <Link href="/" className="flex flex-shrink-0 items-center">
              <div className="relative w-[140px] h-[45px] sm:w-[165px] sm:h-[53px]">
                <Image
                  src="/logos/cams-services-logo.webp"
                  alt="CAMS Services Logo"
                  fill
                  sizes="(max-width: 640px) 140px, 165px"
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Center: Navigation Menu (Desktop) */}
          <nav className="hidden items-center gap-1 lg:flex xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150 xl:px-4 xl:text-base
                  ${link.href === '/dashboard/trainer'
                    ? 'bg-gcal-primary-light text-gcal-primary'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                }
              `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              className="relative rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Bag items"
            >
              <ShoppingBag size={20} />
            </button>

            <button
              className="relative rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>

            <button
              onClick={onSettingsClick}
              className="rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Settings"
            >
              <Settings size={20} />
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="rounded-full p-2 text-slate-600 transition-colors duration-150 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-0 right-0 top-16 z-dropdown border-t border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:hidden"
          >
            <nav className="space-y-2 px-4 py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-150
                    ${link.href === '/dashboard/trainer'
                      ? 'bg-gcal-primary-light text-gcal-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
