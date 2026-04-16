import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { buttonSemanticTokens, type ButtonVariant } from '@/design-system/tokens/semantic.button';
import { resolveMarketingAlignedButtonSize } from '@/design-system/components/Button/buttonSurfaceSizing';

export interface ButtonProps {
  href?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  withArrow?: boolean; // New prop for arrow icon
  title?: string; // Tooltip/title attribute
  form?: string; // Form ID to associate button with (for buttons outside forms)
  /** Set when the button triggers an in-progress action (e.g. form submit). Forwarded as aria-busy. */
  ariaBusy?: boolean;
  /** For link buttons: e.g. target="_blank" rel="noopener noreferrer" for external URLs. */
  target?: string;
  rel?: string;
  'aria-label'?: string;
}

const Button: React.FC<ButtonProps> = ({
  href,
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  disabled = false,
  icon,
  withArrow = false,
  title,
  form,
  ariaBusy,
  target,
  rel,
  'aria-label': ariaLabel,
}) => {
  /** Pill (rounded-header-button) when className has rounded-full; otherwise rounded-form-button (12px) per tailwind config. */
  const usePill = Boolean(className && className.includes('rounded-full'));
  const radiusClass = usePill ? 'rounded-full' : 'rounded-form-button';
  const baseStyles = `${radiusClass} ${buttonSemanticTokens.base}`;
  const disabledStyles = disabled
    ? buttonSemanticTokens.disabledState
    : buttonSemanticTokens.enabledState;

  const variantStyles = disabled
    ? buttonSemanticTokens.variant.disabled[variant]
    : buttonSemanticTokens.variant.enabled[variant];

  const { tokenSize, extraClassName } = resolveMarketingAlignedButtonSize(size);
  const sizeStyles = buttonSemanticTokens.size[tokenSize];
  const surfaceClass = [extraClassName, className].filter(Boolean).join(' ');

  const arrowIcon = withArrow ? (
    <span className={buttonSemanticTokens.arrowIcon[variant]}>
      <ArrowRight size={16} />
    </span>
  ) : null;

  if (href && !disabled) {
    const linkProps = {
      href,
      className: `${baseStyles} ${disabledStyles} ${variantStyles} ${sizeStyles} ${surfaceClass} group`,
      title,
      ...(target && { target }),
      ...(rel && { rel }),
    };
    return (
      <Link {...linkProps}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
        {arrowIcon}
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${disabledStyles} ${variantStyles} ${sizeStyles} ${surfaceClass} group`}
      type={type}
      disabled={disabled}
      title={title}
      form={form}
      aria-busy={ariaBusy}
      aria-label={ariaLabel}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {arrowIcon}
    </button>
  );
};

export default Button;
