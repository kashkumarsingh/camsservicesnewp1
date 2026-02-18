'use client';

import React from 'react';
import type { IconComponent } from '@/types/icons';

export interface StatCardProps {
  /**
   * Title/label for the stat card
   */
  title: string;
  /**
   * Main value to display (can be number or string)
   */
  value: string | number;
  /**
   * Optional icon component from lucide-react
   */
  icon?: IconComponent;
  /**
   * Optional trend indicator (e.g., "+5%", "↑ 10")
   */
  trend?: string;
  /**
   * Optional subtitle/description
   */
  subtitle?: string;
  /**
   * Optional warning message
   */
  warning?: string;
  /**
   * Optional click handler (makes card clickable)
   */
  onClick?: () => void;
  /**
   * Visual variant/style
   */
  variant?: 'default' | 'blue' | 'green' | 'amber' | 'red' | 'indigo' | 'purple' | 'gradient';
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Optional progress bar configuration
   */
  progress?: {
    current: number;
    total: number;
    showLabel?: boolean;
    color?: 'red' | 'amber' | 'green' | 'indigo' | 'blue';
  };
  /**
   * Optional badge/status indicator
   */
  badge?: {
    text: string;
    variant?: 'default' | 'warning' | 'error' | 'success';
  };
}

/**
 * StatCard Component
 * 
 * Reusable card component for displaying statistics with icons, values, and optional progress bars.
 * Follows Clean Architecture principles and WCAG 2.1 AA accessibility standards.
 * 
 * @example
 * ```tsx
 * <StatCard
 *   title="Hours Remaining"
 *   value="15.5h"
 *   icon={Clock}
 *   variant="indigo"
 *   progress={{ current: 5, total: 20, showLabel: true }}
 *   onClick={() => scrollToSection()}
 * />
 * ```
 */
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  warning,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  progress,
  badge,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'blue':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'green':
        return 'bg-green-50 hover:bg-green-100 border-green-200';
      case 'amber':
        return 'bg-amber-50 hover:bg-amber-100 border-amber-200';
      case 'red':
        return 'bg-red-50 hover:bg-red-100 border-red-200';
      case 'indigo':
        return 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200';
      case 'purple':
        return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'gradient':
        return 'bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border-indigo-200';
      case 'default':
      default:
        return 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'p-3 sm:p-4 min-h-[80px]';
      case 'lg':
        return 'p-6 sm:p-8 min-h-[120px]';
      case 'md':
      default:
        return 'p-4 sm:p-6 min-h-[100px]';
    }
  };

  const getValueStyles = () => {
    switch (variant) {
      case 'red':
        return 'text-red-700';
      case 'amber':
        return 'text-amber-700';
      case 'indigo':
        return 'text-indigo-700';
      case 'blue':
        return 'text-blue-700';
      case 'green':
        return 'text-green-700';
      case 'purple':
        return 'text-purple-700';
      case 'gradient':
        return 'text-indigo-700';
      case 'default':
      default:
        return 'text-gray-900';
    }
  };

  const getProgressColor = () => {
    if (progress?.color) {
      switch (progress.color) {
        case 'red':
          return 'bg-red-500';
        case 'amber':
          return 'bg-amber-500';
        case 'green':
          return 'bg-green-600';
        case 'indigo':
          return 'bg-indigo-600';
        case 'blue':
          return 'bg-blue-600';
        default:
          return 'bg-gray-600';
      }
    }
    
    // Auto-detect based on percentage
    if (progress) {
      const percentage = (progress.current / progress.total) * 100;
      if (percentage >= 90) return 'bg-red-500';
      if (percentage >= 70) return 'bg-amber-500';
      return 'bg-green-600';
    }
    
    return 'bg-gray-600';
  };

  const getBadgeStyles = () => {
    switch (badge?.variant) {
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'default':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const progressPercentage = progress
    ? Math.min(100, Math.max(0, (progress.current / progress.total) * 100))
    : null;

  const baseStyles = `rounded-xl border-2 transition-colors text-left w-full flex flex-col justify-center ${
    onClick ? 'cursor-pointer' : ''
  }`;

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();
  const valueStyles = getValueStyles();

  const content = (
    <>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] sm:text-xs md:text-sm text-gray-600">{title}</p>
        {badge && (
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyles()}`}
            aria-label={`Status: ${badge.text}`}
          >
            {badge.text}
          </span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-1">
        <p
          className={`text-xl sm:text-2xl md:text-3xl font-semibold ${valueStyles}`}
          aria-label={`${title}: ${value}`}
        >
          {value}
        </p>
        {trend && (
          <span
            className="text-xs font-semibold text-green-600 flex items-center gap-1"
            aria-label={`Trend: ${trend}`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-gray-500 mt-1" aria-label={`Subtitle: ${subtitle}`}>
          {subtitle}
        </p>
      )}

      {warning && (
        <p
          className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1"
          role="alert"
          aria-label={`Warning: ${warning}`}
        >
          <span>⚠️</span>
          {warning}
        </p>
      )}

      {progress && progressPercentage !== null && (
        <div className="mt-2">
          {progress.showLabel && (
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>{progress.current.toFixed(1)} booked</span>
              <span>{progress.total.toFixed(1)} total</span>
            </div>
          )}
          <div className="w-full bg-gray-200 rounded-full h-1.5" role="progressbar" aria-valuenow={progressPercentage} aria-valuemin={0} aria-valuemax={100} aria-label={`Progress: ${progressPercentage.toFixed(0)}%`}>
            <div
              className={`h-1.5 rounded-full transition-all ${getProgressColor()}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {Icon && (
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4" aria-hidden="true">
          <Icon
            size={size === 'sm' ? 18 : size === 'lg' ? 28 : 24}
            className={variant === 'default' ? 'text-gray-400' : valueStyles.replace('-700', '-600')}
          />
        </div>
      )}
    </>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} relative`}
        aria-label={`${title}: ${value}. Click to view details.`}
      >
        {content}
      </button>
    );
  }

  return (
    <div className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className} relative`}>
      {content}
    </div>
  );
};

export default StatCard;
