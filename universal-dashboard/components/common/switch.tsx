"use client";

import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  /** Label when checked (e.g. "Active"); shown after the toggle */
  checkedLabel?: string;
  /** Label when unchecked (e.g. "Inactive") */
  uncheckedLabel?: string;
  onBlur?: () => void;
  onEscape?: () => void;
  autoFocus?: boolean;
  className?: string;
}

export function Switch({
  checked,
  onChange,
  disabled,
  label,
  checkedLabel = "Active",
  uncheckedLabel = "Inactive",
  onBlur,
  onEscape,
  autoFocus,
  className = "",
}: SwitchProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  React.useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);

  return (
    <label
      className={`inline-flex cursor-pointer items-center gap-2 text-caption text-slate-700 dark:text-slate-200 ${disabled ? "cursor-not-allowed opacity-60" : ""} ${className}`}
    >
      <span
        ref={ref}
        role="switch"
        aria-checked={checked}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.preventDefault();
            onEscape?.();
            return;
          }
          if (disabled) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onChange(!checked);
          }
        }}
        onClick={() => !disabled && onChange(!checked)}
        onBlur={onBlur}
        className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
          checked ? "bg-brand-600" : "bg-slate-200"
        } ${disabled ? "pointer-events-none" : ""}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </span>
      {label !== undefined ? (
        <span>{label}</span>
      ) : (
        <span className="font-medium">{checked ? checkedLabel : uncheckedLabel}</span>
      )}
    </label>
  );
}
