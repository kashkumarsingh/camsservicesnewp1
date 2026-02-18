import type { SelectHTMLAttributes } from "react";
import React from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select: React.FC<SelectProps> = ({ className = "", ...rest }) => {
  return (
    <select
      className={`h-input-h w-full rounded-md border border-slate-300 bg-white px-3 text-ui text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-1 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 ${className}`}
      {...rest}
    />
  );
};

