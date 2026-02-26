'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import AuthButtons from './AuthButtons';
import { ThemeToggle } from '@/components/theme';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/utils/routes';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMenuOpenRef = useRef(isMenuOpen);
  const { user, loading: authLoading, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  // Keep ref in sync with state
  useEffect(() => {
    isMenuOpenRef.current = isMenuOpen;
  }, [isMenuOpen]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMenuOpen]);

  // Close menu when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && isMenuOpenRef.current) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { href: ROUTES.ABOUT, label: 'Who We Are' },
    { href: ROUTES.SERVICES, label: 'What We Do' },
    { href: ROUTES.PACKAGES, label: 'Our Packages' },
    { href: ROUTES.BLOG, label: 'Blog' },
    { href: ROUTES.CONTACT, label: 'Let\'s Connect' },
  ];

  return (
    <header className="sticky top-0 z-sticky w-full border-b border-white/10 bg-navy-blue" >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center">
            <div className="relative h-8 w-[120px] sm:h-9 sm:w-[140px] md:h-10 md:w-[160px]">
              <Image
                src="/logos/cams-services-logo.webp"
                alt="CAMS Services"
                fill
                sizes="(max-width: 640px) 120px, (max-width: 768px) 140px, 160px"
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </Link>

          {/* Desktop: centre nav – white text links */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-white hover:text-white/90 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop: right – Become a Trainer (pill) | Theme | Login | Register – per reference */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href={ROUTES.BECOME_A_TRAINER}
              className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white hover:opacity-95 transition-opacity whitespace-nowrap"
            >
              Become a Trainer
            </Link>
            <ThemeToggle className="text-white hover:text-white/90 hover:bg-white/10" />
            <AuthButtons variant="dark" />
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={toggleMenu}
            className="lg:hidden inline-flex items-center justify-center p-2 -mr-2 text-white hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-blue rounded-md"
            aria-expanded={isMenuOpen}
            aria-label="Open menu"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu – full-screen overlay (Payhawk-style: simple list) */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-overlay bg-gradient-to-b from-white to-blue-50/30 flex flex-col lg:hidden animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-primary-blue/20">
            <Link href="/" onClick={closeMenu} className="flex-shrink-0">
              <div className="relative h-8 w-[120px]">
                <Image
                  src="/logos/cams-services-logo.webp"
                  alt="CAMS Services"
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="120px"
                />
              </div>
            </Link>
            <button
              type="button"
              onClick={closeMenu}
              className="p-2 text-navy-blue hover:text-primary-blue rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-6 px-4">
            <ul className="space-y-1">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={closeMenu}
                    className="block py-3 text-base font-medium text-navy-blue hover:text-primary-blue transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href={ROUTES.BECOME_A_TRAINER} onClick={closeMenu} className="block py-3 text-base font-medium text-navy-blue hover:text-primary-blue transition-colors">
                  Become a Trainer
                </Link>
              </li>
            </ul>
            <div className="mt-6 pt-6 border-t border-primary-blue/20 flex flex-col gap-2">
              <ThemeToggle />
              <AuthButtons isMobile />
            </div>
          </nav>
          <p className="px-4 py-4 text-center text-xs text-navy-blue/70 border-t border-primary-blue/10">
            &copy; {new Date().getFullYear()} CAMS Services
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
