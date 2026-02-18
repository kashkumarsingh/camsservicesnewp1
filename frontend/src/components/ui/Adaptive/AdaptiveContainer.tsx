'use client';

import React from 'react';
import type { SmartResponsiveReturn } from '@/interfaces/web/hooks/responsive/useSmartResponsive';

interface AdaptiveContainerProps {
  children: React.ReactNode;
  responsive: SmartResponsiveReturn;
  className?: string;
  /** Whether to apply adaptive spacing */
  adaptiveSpacing?: boolean;
  /** Whether to apply adaptive padding */
  adaptivePadding?: boolean;
}

/**
 * Adaptive Container Component
 * 
 * Applies context-aware spacing and padding based on device type and content density.
 */
export function AdaptiveContainer({
  children,
  responsive,
  className = '',
  adaptiveSpacing = true,
  adaptivePadding = true,
}: AdaptiveContainerProps) {
  // Adaptive spacing classes
  const spacingClass = adaptiveSpacing
    ? {
        compact: 'space-y-2 sm:space-y-3',
        normal: 'space-y-4 lg:space-y-6',
        comfortable: 'space-y-6 lg:space-y-8',
      }[responsive.spacing]
    : '';

  // Adaptive padding classes
  const paddingClass = adaptivePadding
    ? {
        small: 'p-3 sm:p-4',
        medium: 'p-4 sm:p-5',
        large: 'p-6 sm:p-8',
      }[responsive.padding]
    : '';

  return (
    <div className={`${spacingClass} ${paddingClass} ${className}`.trim()}>
      {children}
    </div>
  );
}

/**
 * Adaptive Text Component
 * 
 * Applies context-aware text sizing based on device type.
 */
interface AdaptiveTextProps {
  children: React.ReactNode;
  responsive: SmartResponsiveReturn;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
  className?: string;
}

export function AdaptiveText({
  children,
  responsive,
  as: Component = 'p',
  className = '',
}: AdaptiveTextProps) {
  const textSizeClass = {
    small: 'text-xs sm:text-sm',
    medium: 'text-sm sm:text-base',
    large: 'text-base sm:text-lg',
  }[responsive.textSize];

  return (
    <Component className={`${textSizeClass} ${className}`.trim()}>
      {children}
    </Component>
  );
}

/**
 * Adaptive Button Container
 * 
 * Applies context-aware button layout (inline vs stacked).
 */
interface AdaptiveButtonContainerProps {
  children: React.ReactNode;
  responsive: SmartResponsiveReturn;
  className?: string;
}

export function AdaptiveButtonContainer({
  children,
  responsive,
  className = '',
}: AdaptiveButtonContainerProps) {
  const layoutClass = responsive.showActionsInline
    ? 'flex flex-row items-center gap-2 sm:gap-3'
    : 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3';

  return (
    <div className={`${layoutClass} ${className}`.trim()}>
      {children}
    </div>
  );
}
