'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Users,
  UserCheck,
  ChevronDown,
  Activity,
  Briefcase,
  Package,
  FileText,
  BarChart2,
  Settings,
} from 'lucide-react';

const QUICK_NAV_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Bookings', href: '/dashboard/admin/bookings', icon: Calendar },
  { label: 'Parents', href: '/dashboard/admin/parents', icon: Users },
  { label: 'Children', href: '/dashboard/admin/children', icon: Users },
  { label: 'Trainers', href: '/dashboard/admin/trainers', icon: UserCheck },
];

const MORE_ITEMS: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { label: 'Users', href: '/dashboard/admin/users', icon: Users },
  { label: 'Activities', href: '/dashboard/admin/activities', icon: Activity },
  { label: 'Services', href: '/dashboard/admin/services', icon: Briefcase },
  { label: 'Packages', href: '/dashboard/admin/packages', icon: Package },
  { label: 'Public pages', href: '/dashboard/admin/public-pages', icon: FileText },
  { label: 'Reports', href: '/dashboard/admin/reports', icon: BarChart2 },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === '/dashboard/admin') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

export function AdminQuickNavBar() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [moreOpen]);

  return (
    <nav
      className="flex flex-wrap items-center gap-1 border-b border-slate-200 bg-slate-50/80 py-2 dark:border-slate-700 dark:bg-slate-800/50"
      aria-label="Quick navigation"
    >
      <div className="flex flex-wrap items-center gap-0.5">
        {QUICK_NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200'
                  : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              {label}
            </Link>
          );
        })}
        <div className="relative ml-0.5" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              moreOpen
                ? 'bg-slate-200 text-slate-900 dark:bg-slate-600 dark:text-slate-100'
                : 'text-slate-700 hover:bg-slate-200/80 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-controls="quick-nav-more-menu"
            id="quick-nav-more-trigger"
          >
            More
            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`} aria-hidden />
          </button>
          {moreOpen && (
            <div
              id="quick-nav-more-menu"
              role="menu"
              aria-labelledby="quick-nav-more-trigger"
              className="absolute left-0 top-full z-50 mt-1 min-w-[180px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              {MORE_ITEMS.map(({ label, href, icon: Icon }) => {
                const active = isActivePath(pathname, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    role="menuitem"
                    onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? 'bg-indigo-50 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
