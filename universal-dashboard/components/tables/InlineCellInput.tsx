"use client";

import React from "react";
import { Switch } from "@/components/common/switch";

export type InlineCellInputType =
  | "text"
  | "email"
  | "number"
  | "date"
  | "time"
  | "select"
  | "textarea"
  | "boolean";

export interface InlineCellInputProps<T = string | number | boolean> {
  type: InlineCellInputType;
  value: T;
  onChange: (value: T) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  booleanLabel?: string;
  onEnter?: () => void;
  onEscape?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const baseInputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-caption text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

export function InlineCellInput<T = string | number | boolean>({
  type,
  value,
  onChange,
  options = [],
  placeholder,
  min,
  max,
  step,
  booleanLabel = "Active",
  onEnter,
  onEscape,
  onBlur,
  disabled,
  autoFocus,
  className = "",
}: InlineCellInputProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      onEscape?.();
    }
  };

  const blurHandler = () => {
    onBlur?.();
  };

  if (type === "textarea") {
    return (
      <textarea
        className={`${baseInputClass} min-h-[60px] resize-y ${className}`}
        value={(value ?? "") as string}
        onChange={(e) => onChange(e.target.value as T)}
        onKeyDown={handleKeyDown}
        onBlur={blurHandler}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
    );
  }

  if (type === "select") {
    return (
      <select
        className={`${baseInputClass} cursor-pointer ${className}`}
        value={(value ?? "") as string}
        onChange={(e) => onChange(e.target.value as T)}
        onKeyDown={handleKeyDown}
        onBlur={blurHandler}
        disabled={disabled}
        autoFocus={autoFocus}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  if (type === "boolean") {
    return (
      <Switch
        checked={Boolean(value)}
        onChange={(v) => onChange(v as T)}
        checkedLabel={booleanLabel}
        uncheckedLabel="Inactive"
        onBlur={blurHandler}
        onEscape={onEscape}
        autoFocus={autoFocus}
        disabled={disabled}
      />
    );
  }

  const inputType = type === "number" || type === "date" || type === "time" || type === "email" ? type : "text";
  const numValue =
    type === "number"
      ? value === "" || value === undefined || value === null
        ? ""
        : Number(value)
      : (value ?? "") as string;

  return (
    <input
      type={inputType}
      className={`${baseInputClass} ${className}`}
      value={inputType === "number" ? numValue : (value ?? "") as string}
      onChange={(e) =>
        onChange(
          (inputType === "number"
            ? (e.target.value === "" ? (0 as T) : (Number(e.target.value) as T))
            : e.target.value as T),
        )
      }
      onKeyDown={handleKeyDown}
      onBlur={blurHandler}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      autoFocus={autoFocus}
    />
  );
}
