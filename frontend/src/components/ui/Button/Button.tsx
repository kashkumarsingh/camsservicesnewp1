import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  href?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'bordered' | 'ghost' | 'outline' | 'outlineNavy' | 'outlineWhite' | 'purple' | 'yellow' | 'superPlayful' | 'destructive' | 'destructive-outline';
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
}

const Button: React.FC<ButtonProps> = ({ href, onClick, children, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, icon, withArrow = false, title, form, ariaBusy }) => {
  /** Pill (rounded-header-button) when className has rounded-full; otherwise rounded-form-button (12px) per tailwind config. */
  const usePill = Boolean(className && className.includes('rounded-full'));
  const radiusClass = usePill ? 'rounded-full' : 'rounded-form-button';
  const baseStyles = `${radiusClass} font-semibold transition-all duration-200 inline-flex items-center justify-center space-x-2`;
  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none select-none'
    : 'cursor-pointer';

  const getVariantStyles = () => {
    if (disabled) {
      switch (variant) {
        case 'primary':
          return 'bg-gradient-to-r from-primary-blue to-navy-blue text-white ring-0 shadow-md opacity-90';
        case 'secondary':
          return 'bg-navy-blue text-white ring-0 shadow-md';
        case 'bordered':
          return 'border-2 border-primary-blue text-primary-blue bg-white';
        case 'ghost':
          return 'bg-gray-100 text-gray-700 border border-gray-300';
        case 'outline':
          return 'border-2 border-primary-blue bg-white text-primary-blue';
        case 'outlineNavy':
          return 'rounded-full border-2 border-navy-blue bg-white text-navy-blue ring-0 shadow-none';
        case 'outlineWhite':
          return 'border-2 border-white bg-white/10 text-white';
        case 'purple':
        case 'superPlayful':
          return 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md';
        case 'yellow':
          return 'bg-gradient-to-r from-star-gold to-cta-accent-start text-navy-blue border-0 shadow-md';
        case 'destructive':
          return 'bg-rose-600 text-white ring-0 shadow-md';
        case 'destructive-outline':
          return 'border border-rose-300 text-rose-600 bg-white';
        default:
          return 'bg-primary-blue text-white ring-0 shadow-md';
      }
    }

    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-primary-blue to-navy-blue text-white shadow-md hover:shadow-lg hover:from-primary-blue hover:to-light-blue-cyan active:shadow-md transition-all duration-200 ring-0';
      case 'secondary':
        return 'bg-navy-blue text-white shadow-md hover:bg-gray-800 hover:shadow-lg transition-all duration-200 ring-0';
      case 'bordered':
        return 'border-2 border-primary-blue text-primary-blue bg-white shadow-sm hover:bg-primary-blue hover:text-white hover:shadow-md transition-all duration-200';
      case 'ghost':
        return 'bg-gray-100 text-gray-800 border border-gray-300 hover:bg-gray-200 hover:border-gray-400 transition-all duration-200';
      case 'outline':
        return 'border-2 border-primary-blue bg-white text-primary-blue shadow-sm hover:bg-primary-blue hover:text-white hover:shadow-md transition-all duration-200';
      case 'outlineNavy':
        return 'rounded-full border-2 border-navy-blue bg-white text-navy-blue ring-0 shadow-none hover:bg-navy-blue hover:text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200';
      case 'outlineWhite':
        return 'border-2 border-white bg-white/15 text-white shadow-md hover:bg-white hover:text-primary-blue hover:shadow-lg transition-all duration-200';
      case 'purple':
      case 'superPlayful':
        return 'bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white border-0 shadow-md hover:shadow-lg hover:brightness-105 transition-all duration-200';
      case 'yellow':
        return 'bg-gradient-to-r from-star-gold to-cta-accent-start text-navy-blue border-0 shadow-md hover:shadow-lg hover:brightness-105 active:shadow-md transition-all duration-200';
      case 'destructive':
        return 'bg-rose-600 text-white border-0 shadow-md hover:bg-rose-700 hover:shadow-lg focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200';
      case 'destructive-outline':
        return 'bg-white text-rose-600 border border-rose-300 shadow-sm hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200';
      default:
        return 'bg-gradient-to-r from-primary-blue to-navy-blue text-white shadow-md hover:shadow-lg hover:from-primary-blue hover:to-light-blue-cyan transition-all duration-200 ring-0';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-8 py-4 text-lg';
      case 'md':
      default:
        return 'px-6 py-3 text-base';
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const getArrowIconStyles = () => {
    switch (variant) {
      case 'primary':
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
      case 'secondary':
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
      case 'bordered':
        return 'ml-2 w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:bg-primary-blue group-hover:text-white transition-colors duration-200';
      case 'ghost':
        return 'ml-2 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 group-hover:bg-gray-300 group-hover:text-gray-900 transition-colors duration-200';
      case 'outline':
        return 'ml-2 w-6 h-6 rounded-full bg-primary-blue/10 flex items-center justify-center text-primary-blue group-hover:bg-white group-hover:text-primary-blue transition-colors duration-200';
      case 'outlineNavy':
        return 'ml-2 w-6 h-6 rounded-full bg-navy-blue/10 flex items-center justify-center text-navy-blue group-hover:bg-white/20 group-hover:text-white transition-colors duration-300';
      case 'outlineWhite':
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
      case 'purple':
      case 'superPlayful':
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
      case 'yellow':
        return 'ml-2 w-6 h-6 rounded-full bg-navy-blue/15 flex items-center justify-center text-navy-blue hover:bg-navy-blue/25 transition-colors duration-200';
      case 'destructive':
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
      case 'destructive-outline':
        return 'ml-2 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-200 transition-colors duration-200';
      default:
        return 'ml-2 w-6 h-6 rounded-full bg-white/25 flex items-center justify-center text-white hover:bg-white/40 transition-colors duration-200';
    }
  };

  const arrowIcon = withArrow ? (
    <span className={getArrowIconStyles()}>
      <ArrowRight size={16} />
    </span>
  ) : null;

  if (href && !disabled) {
    return (
      <Link href={href} className={`${baseStyles} ${disabledStyles} ${variantStyles} ${sizeStyles} ${className} group`} title={title}>
        {icon && <span className="mr-2">{icon}</span>}
        {children}
        {arrowIcon}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${disabledStyles} ${variantStyles} ${sizeStyles} ${className} group`} type={type} disabled={disabled} title={title} form={form} aria-busy={ariaBusy}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {arrowIcon}
    </button>
  );
};

export default Button;
