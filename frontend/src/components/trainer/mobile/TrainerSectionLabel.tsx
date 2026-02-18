'use client';

import React from 'react';

export interface TrainerSectionLabelProps {
  /** Uppercase section title (e.g. "USED", "FEBRUARY", "INFO", "QUALIFICATIONS") */
  children: string;
  /** Optional horizontal rules on both sides (reference "USED" style) */
  withRules?: boolean;
  className?: string;
}

/**
 * Grey uppercase section header for trainer screens.
 * Matches reference: light grey bg or transparent, uppercase, bold-ish.
 */
export default function TrainerSectionLabel({
  children,
  withRules = false,
  className = '',
}: TrainerSectionLabelProps) {
  if (withRules) {
    return (
      <div
        className={`flex items-center gap-3 py-2 px-4 bg-gray-100 ${className}`}
        role="heading"
        aria-level={2}
      >
        <span className="flex-1 h-px bg-gray-300" aria-hidden />
        <span className="text-gray-600 font-semibold text-xs uppercase tracking-wide flex-shrink-0">
          {children}
        </span>
        <span className="flex-1 h-px bg-gray-300" aria-hidden />
      </div>
    );
  }

  return (
    <h2
      className={`text-gray-500 font-semibold text-xs uppercase tracking-wide py-2 px-4 ${className}`}
    >
      {children}
    </h2>
  );
}
