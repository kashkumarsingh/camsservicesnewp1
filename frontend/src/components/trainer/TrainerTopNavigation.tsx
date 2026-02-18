'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShoppingBag, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';

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
    { href: '/about', label: 'Who We Are' },
    { href: '/services', label: 'What We Do' },
    { href: '/packages', label: 'Our Packages' },
    { href: '/blog', label: 'Blog' },
    { href: '/contact', label: "Let's Connect" },
    { href: '/dashboard/trainer', label: 'Dashboard' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#2C5F8D] shadow-md">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo and Back Arrow */}
          <div className="flex items-center gap-4">
            {onBackClick && (
              <button
                onClick={onBackClick}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
            )}
            <Link href="/" className="flex-shrink-0 flex items-center">
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
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  px-3 xl:px-4 py-2 text-sm xl:text-base font-medium rounded-lg transition-colors
                  ${link.href === '/dashboard/trainer'
                    ? 'bg-white/20 text-white'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Bag Items (placeholder - can be implemented later) */}
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              aria-label="Bag items"
            >
              <ShoppingBag size={20} className="text-white" />
              {/* Badge can be added here if needed */}
            </button>

            {/* Notifications */}
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={20} className="text-white" />
              {/* Badge can be added here if needed */}
            </button>

            {/* Settings */}
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Settings"
            >
              <Settings size={20} className="text-white" />
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Logout"
            >
              <LogOut size={20} className="text-white" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="lg:hidden absolute top-16 left-0 right-0 bg-[#2C5F8D] border-t border-white/10 shadow-lg"
          >
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    block px-4 py-3 text-base font-medium rounded-lg transition-colors
                    ${link.href === '/dashboard/trainer'
                      ? 'bg-white/20 text-white'
                      : 'text-white/90 hover:text-white hover:bg-white/10'
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
