import type { ButtonHTMLAttributes, ReactNode } from "react";
import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";

const byVariant: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 focus-visible:ring-brand-600",
  secondary:
    "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50 focus-visible:ring-slate-900",
  ghost:
    "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-600",
};

const bySize: Record<Size, string> = {
  sm: "h-button-sm-h px-3 text-caption",
  md: "h-button-md-h px-4 text-ui",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}) => {
  return (
    <button
      className={`${base} ${byVariant[variant]} ${bySize[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
};

