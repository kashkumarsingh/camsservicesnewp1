'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import React from 'react';

export interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: Crumb[];
  trailing?: ReactNode;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  trailing,
  className = '',
}) => {
  if (!items.length) return null;
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && <span aria-hidden>/</span>}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-slate-700 hover:underline dark:hover:text-slate-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={
                    isLast ? 'font-medium text-slate-700 dark:text-slate-200' : ''
                  }
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {trailing}
    </nav>
  );
};
