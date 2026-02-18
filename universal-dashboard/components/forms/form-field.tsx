import React from "react";

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}) => {
  return (
    <div className="space-y-1 text-body">
      <label
        htmlFor={htmlFor}
        className="block text-caption font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-0.5 text-caption text-rose-600">{error}</p>
      ) : hint ? (
        <p className="mt-0.5 text-caption text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

