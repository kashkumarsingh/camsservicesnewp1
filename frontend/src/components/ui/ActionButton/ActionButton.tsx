'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { Loader2 } from 'lucide-react';

export interface ActionButtonProps {
  /**
   * Button variant (extends Button component variants)
   */
  variant?: 'primary' | 'secondary' | 'bordered' | 'ghost' | 'outline' | 'outlineWhite' | 'purple' | 'yellow' | 'superPlayful';
  /**
   * Button size
   */
  size?: 'sm' | 'md' | 'lg';
  /**
   * Optional icon (React node)
   */
  icon?: React.ReactNode;
  /**
   * Loading state (shows spinner and disables button)
   */
  loading?: boolean;
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Optional href for Link button
   */
  href?: string;
  /**
   * Button content
   */
  children: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Button type
   */
  type?: 'button' | 'submit' | 'reset';
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * ARIA label for accessibility
   */
  'aria-label'?: string;
}

/**
 * ActionButton Component
 * 
 * Enhanced Button component with loading state support.
 * Extends the base Button component with additional action-specific features.
 * Follows Clean Architecture principles and WCAG 2.1 AA accessibility standards.
 * 
 * @example
 * ```tsx
 * <ActionButton
 *   variant="primary"
 *   size="md"
 *   icon={<Plus />}
 *   loading={isSubmitting}
 *   onClick={handleSubmit}
 * >
 *   Submit
 * </ActionButton>
 * ```
 */
const ActionButton: React.FC<ActionButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  onClick,
  href,
  children,
  className = '',
  type = 'button',
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  const isDisabled = disabled || loading;

  // Show spinner when loading
  const loadingIcon = loading ? (
    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  ) : null;

  // Use loading icon if loading, otherwise use provided icon
  const displayIcon = loading ? loadingIcon : icon;

  return (
    <Button
      variant={variant}
      size={size}
      icon={displayIcon}
      onClick={onClick}
      href={href}
      className={className}
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel || (loading ? `${children} (loading)` : undefined)}
    >
      {children}
    </Button>
  );
};

export default ActionButton;
