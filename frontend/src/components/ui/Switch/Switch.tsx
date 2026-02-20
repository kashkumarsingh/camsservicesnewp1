'use client';

import React from 'react';

export interface SwitchProps {
  /** Controlled checked state. */
  checked: boolean;
  /** Called when the user toggles the switch. */
  onCheckedChange: (checked: boolean) => void;
  /** Disables the switch. */
  disabled?: boolean;
  /** Size: default (md) or sm for compact (e.g. table rows). */
  size?: 'sm' | 'md';
  /** Accessible label (e.g. "Publish page", "Activate trainer"). */
  'aria-label': string;
  /** Optional tooltip. */
  title?: string;
  /** Extra class names for the root element. */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-7',
  md: 'h-5 w-9',
};

const thumbSizeClasses = {
  sm: 'h-3 w-3 translate-x-0.5 group-data-[state=checked]:translate-x-3.5',
  md: 'h-4 w-4 translate-x-0.5 group-data-[state=checked]:translate-x-4',
};

/**
 * Accessible toggle switch. Use for binary on/off state (e.g. published, active).
 * In table row actions, use size="sm" and stop propagation in the parent when handling click.
 */
export const Switch: React.FC<SwitchProps> = ({
  checked,
  onCheckedChange,
  disabled = false,
  size = 'md',
  'aria-label': ariaLabel,
  title,
  className = '',
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) onCheckedChange(!checked);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) onCheckedChange(!checked);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      title={title ?? ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-state={checked ? 'checked' : 'unchecked'}
      className={`
        group inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent
        transition-colors focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${sizeClasses[size]}
        ${checked ? 'bg-primary-blue' : 'bg-slate-200 dark:bg-slate-600'}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
    >
      <span
        className={`
          pointer-events-none block rounded-full bg-white shadow-sm transition-transform
          ${thumbSizeClasses[size]}
        `.trim().replace(/\s+/g, ' ')}
      />
    </button>
  );
};
