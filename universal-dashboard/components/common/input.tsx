import type { InputHTMLAttributes } from "react";
import React from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = ({ className = "", ...rest }) => {
  return (
    <input
      className={`h-input-h w-full rounded-md border border-slate-300 bg-white px-3 text-ui text-slate-900 shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 ${className}`}
      {...rest}
    />
  );
};

