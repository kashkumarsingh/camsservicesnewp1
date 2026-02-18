'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarPlus,
  UserPlus,
  Baby,
  UserCheck,
  ChevronDown,
  FileText,
  Settings,
  ClipboardList,
  CalendarOff,
} from 'lucide-react';

const QUICK_ACTION_ITEMS: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: 'New Booking', href: '/dashboard/admin/bookings', icon: CalendarPlus },
  { label: 'Add Parent', href: '/dashboard/admin/parents', icon: UserPlus },
  { label: 'Add Child', href: '/dashboard/admin/children', icon: Baby },
  { label: 'Add Trainer', href: '/dashboard/admin/trainers', icon: UserCheck },
  { label: 'Absence requests', href: '/dashboard/admin/absence-requests', icon: CalendarOff },
];

const MORE_ACTIONS: {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { label: 'View reports', href: '/dashboard/admin/reports', icon: FileText },
  { label: 'Trainer applications', href: '/dashboard/admin/trainer-applications', icon: ClipboardList },
  { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
];

export function AdminQuickActionsBar() {
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
    <div
      className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white px-2 py-2 dark:border-slate-700 dark:bg-slate-900/50"
      role="toolbar"
      aria-label="Quick actions"
    >
      <div className="flex flex-wrap items-center gap-2">
        {QUICK_ACTION_ITEMS.map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-800 shadow-sm transition-colors hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-200 dark:hover:bg-indigo-900/50"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </Link>
        ))}
        <div className="relative" ref={moreRef}>
          <button
            type="button"
            onClick={() => setMoreOpen((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            aria-expanded={moreOpen}
            aria-haspopup="true"
            aria-controls="quick-actions-more-menu"
            id="quick-actions-more-trigger"
          >
            More
            <ChevronDown
              className={`h-4 w-4 shrink-0 transition-transform ${moreOpen ? 'rotate-180' : ''}`}
              aria-hidden
            />
          </button>
          {moreOpen && (
            <div
              id="quick-actions-more-menu"
              role="menu"
              aria-labelledby="quick-actions-more-trigger"
              className="absolute left-0 top-full z-50 mt-1 min-w-[200px] rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800"
            >
              {MORE_ACTIONS.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  role="menuitem"
                  onClick={() => setMoreOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  <Icon className="h-4 w-4 shrink-0" aria-hidden />
                  {label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
