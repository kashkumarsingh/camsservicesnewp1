'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/interfaces/web/hooks/auth/useAuth';
import AuthButtons from './AuthButtons';
import { ThemeToggle } from '@/components/theme';
import { useRouter } from 'next/navigation';

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
    { href: '/about', label: 'Who We Are' },
    { href: '/services', label: 'What We Do' },
    { href: '/packages', label: 'Our Packages' },
    { href: '/trainers', label: 'Our Team' },
    { href: '/blog', label: 'Blog' },
    { href: '/faq', label: 'FAQ' },
    { href: '/policies', label: 'Policies' },
    { href: '/contact', label: "Let's Connect" },
  ];

  return (
    <header className="sticky top-0 z-[999] w-full border-b border-slate-200 bg-white">
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

          {/* Desktop: centre nav – plain text links (Payhawk-style) */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Main">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                {link.label}
              </Link>
            ))}
            {!authLoading && !isAuthenticated && !user && (
              <Link
                href="/become-a-trainer"
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors whitespace-nowrap"
              >
                Become a Trainer
              </Link>
            )}
          </nav>

          {/* Desktop: right – Login (text) + primary CTA + theme (Payhawk: Login | Start free trial | Get a demo) */}
          <div className="hidden lg:flex items-center gap-6">
            <ThemeToggle />
            <AuthButtons />
          </div>

          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={toggleMenu}
            className="lg:hidden inline-flex items-center justify-center p-2 -mr-2 text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-400 rounded-md"
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
          className="fixed inset-0 z-[999] bg-white flex flex-col lg:hidden animate-fade-in"
          aria-modal="true"
          role="dialog"
        >
          <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200">
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
              className="p-2 text-slate-600 hover:text-slate-900 rounded-md"
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
                    className="block py-3 text-base font-medium text-slate-800 hover:text-[var(--color-primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {!authLoading && !isAuthenticated && !user && (
                <li>
                  <Link href="/become-a-trainer" onClick={closeMenu} className="block py-3 text-base font-medium text-slate-800 hover:text-[var(--color-primary)]">
                    Become a Trainer
                  </Link>
                </li>
              )}
            </ul>
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col gap-2">
              <ThemeToggle />
              <AuthButtons isMobile />
            </div>
          </nav>
          <p className="px-4 py-4 text-center text-xs text-slate-500 border-t border-slate-100">
            &copy; {new Date().getFullYear()} CAMS Services
          </p>
        </div>
      )}
    </header>
  );
};

export default Header;
