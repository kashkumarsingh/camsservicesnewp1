'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';
import type { IconComponent } from '@/types/icons';

/** Primary blue from reference design (#2196F3 / Material primary) */
const HEADER_BG = 'bg-[#2196F3]';

export interface TrainerMobileHeaderProps {
  /** Screen title (e.g. "Schedule", "Absences", "My profile") */
  title: string;
  /** Back button callback; omit to hide back button */
  onBack?: () => void;
  /** Right-side icon (e.g. plus, edit, calendar). Rendered as a button. */
  rightIcon?: IconComponent;
  /** Right icon click handler */
  onRightIconClick?: () => void;
  /** Optional subtitle below title (e.g. year range "1 Jan 2026 – 31 Dec 2026") */
  subtitle?: string;
  /** Optional year or secondary line below title with chevron (e.g. "2026" with >) */
  yearLine?: string;
  onYearLineClick?: () => void;
  /** Extra class for the header container */
  className?: string;
}

/**
 * Blue app header for trainer mobile/tablet screens.
 * Matches reference: white back arrow, centred title, optional right icon, optional year/subtitle.
 */
export default function TrainerMobileHeader({
  title,
  onBack,
  rightIcon: RightIcon,
  onRightIconClick,
  subtitle,
  yearLine,
  onYearLineClick,
  className = '',
}: TrainerMobileHeaderProps) {
  return (
    <header
      className={`${HEADER_BG} text-white pt-[env(safe-area-inset-top)] ${className}`}
      role="banner"
    >
      <div className="flex items-center min-h-[48px] sm:min-h-[52px] px-3 sm:px-4">
        <div className="w-10 flex-shrink-0 flex items-center justify-start">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Go back"
            >
              <ChevronLeft size={24} className="text-white" aria-hidden />
            </button>
          ) : null}
        </div>
        <h1 className="flex-1 text-center text-lg sm:text-xl font-bold truncate px-2 min-w-0">
          {title}
        </h1>
        <div className="w-10 flex-shrink-0 flex items-center justify-end">
          {RightIcon && onRightIconClick ? (
            <button
              type="button"
              onClick={onRightIconClick}
              className="p-2 -mr-2 rounded-full hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Action"
            >
              <RightIcon size={24} className="text-white" aria-hidden />
            </button>
          ) : null}
        </div>
      </div>
      {(subtitle || yearLine) && (
        <div className="pb-2 pt-0 text-center">
          {yearLine && (
            <button
              type="button"
              onClick={onYearLineClick}
              className="flex items-center justify-center gap-1 mx-auto text-white font-bold text-base sm:text-lg"
            >
              {yearLine}
              <span className="text-white/80">›</span>
            </button>
          )}
          {subtitle && (
            <p className="text-white/90 text-xs sm:text-sm mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
