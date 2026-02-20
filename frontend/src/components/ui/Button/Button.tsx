import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface ButtonProps {
  href?: string;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'bordered' | 'ghost' | 'outline' | 'outlineWhite' | 'purple' | 'yellow' | 'superPlayful' | 'destructive' | 'destructive-outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  icon?: React.ReactNode;
  withArrow?: boolean; // New prop for arrow icon
  title?: string; // Tooltip/title attribute
  form?: string; // Form ID to associate button with (for buttons outside forms)
}

const Button: React.FC<ButtonProps> = ({ href, onClick, children, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, icon, withArrow = false, title, form }) => {
  const baseStyles = 'rounded-lg font-semibold transition-all duration-200 inline-flex items-center justify-center space-x-2 shadow-sm ring-1 ring-black/5';
  const disabledStyles = disabled
    ? 'opacity-40 cursor-not-allowed pointer-events-none select-none'
    : 'cursor-pointer';

  const getVariantStyles = () => {
    if (disabled) {
      switch (variant) {
        case 'primary':
          return 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] ring-[var(--color-primary)]/30';
        case 'secondary':
          return 'bg-slate-800 text-white ring-slate-600/30';
        case 'bordered':
          return 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white';
        case 'ghost':
          return 'bg-slate-100 text-slate-700 border border-slate-300';
        case 'outline':
          return 'border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)]';
        case 'outlineWhite':
          return 'border-2 border-white bg-white/10 text-white';
        case 'purple':
        case 'superPlayful':
          return 'bg-[var(--color-primary)] text-white border-2 border-white/50 shadow-md';
        case 'yellow':
          return 'bg-amber-300 text-slate-900 border-2 border-amber-400 shadow-md';
        case 'destructive':
          return 'bg-rose-600 text-white ring-rose-500/30';
        case 'destructive-outline':
          return 'border border-rose-300 text-rose-600 bg-white';
        default:
          return 'bg-[var(--color-primary)] text-white';
      }
    }

    switch (variant) {
      case 'primary':
        return 'bg-[var(--color-primary)] text-[var(--color-primary-foreground)] shadow-md ring-[var(--color-primary)]/20 hover:brightness-110 hover:shadow-lg';
      case 'secondary':
        return 'bg-slate-800 text-white shadow-md ring-slate-600/20 hover:bg-slate-700 hover:shadow-lg';
      case 'bordered':
        return 'border-2 border-[var(--color-primary)] text-[var(--color-primary)] bg-white shadow-sm hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] hover:shadow-md';
      case 'ghost':
        return 'bg-slate-100 text-slate-800 border border-slate-300 hover:bg-slate-200 hover:border-slate-400';
      case 'outline':
        return 'border-2 border-[var(--color-primary)] bg-white text-[var(--color-primary)] shadow-sm hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] hover:shadow-md';
      case 'outlineWhite':
        return 'border-2 border-white bg-white/15 text-white shadow-md hover:bg-white hover:text-[var(--color-primary)] hover:shadow-lg';
      case 'purple':
      case 'superPlayful':
        return 'bg-[var(--color-primary)] text-white border-2 border-white/50 shadow-md hover:brightness-110 hover:shadow-lg hover:border-white';
      case 'yellow':
        return 'bg-amber-300 text-slate-900 border-2 border-amber-500 shadow-md hover:bg-amber-400 hover:shadow-lg';
      case 'destructive':
        return 'bg-rose-600 text-white border border-rose-600 shadow-sm hover:bg-rose-700 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2';
      case 'destructive-outline':
        return 'bg-white text-rose-600 border border-rose-300 shadow-sm hover:bg-rose-50 hover:text-rose-700 hover:border-rose-400 focus:ring-2 focus:ring-rose-500 focus:ring-offset-2';
      default:
        return 'bg-[var(--color-primary)] text-white shadow-md hover:brightness-110 hover:shadow-lg';
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
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[var(--color-primary-foreground)] hover:bg-white/40 hover:text-[var(--color-primary)] transition-colors duration-200';
      case 'secondary':
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 hover:text-slate-900 transition-colors duration-200';
      case 'bordered':
        return 'ml-2 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition-colors duration-200';
      case 'ghost':
        return 'ml-2 w-6 h-6 rounded-full bg-slate-900/5 flex items-center justify-center text-slate-700 hover:bg-slate-900/10 hover:text-slate-900 transition-colors duration-200';
      case 'outline':
        return 'ml-2 w-6 h-6 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-[var(--color-primary-foreground)] transition-colors duration-200';
      case 'outlineWhite':
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/40 hover:text-[var(--color-primary)] transition-colors duration-200';
      case 'purple':
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:text-primary-blue transition-colors duration-300';
      case 'yellow':
        return 'ml-2 w-6 h-6 rounded-full bg-navy-blue/10 flex items-center justify-center text-navy-blue hover:bg-navy-blue hover:text-white transition-colors duration-300';
      case 'superPlayful':
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:text-primary-blue transition-colors duration-300';
      case 'destructive':
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors duration-200';
      case 'destructive-outline':
        return 'ml-2 w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 hover:bg-rose-200 transition-colors duration-200';
      default:
        return 'ml-2 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 hover:text-primary-blue transition-colors duration-300';
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
    <button onClick={onClick} className={`${baseStyles} ${disabledStyles} ${variantStyles} ${sizeStyles} ${className} group`} type={type} disabled={disabled} title={title} form={form}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {arrowIcon}
    </button>
  );
};

export default Button;
