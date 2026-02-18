import React from "react";

export interface FormWrapperProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  title,
  description,
  children,
  className = "",
  ...rest
}) => {
  return (
    <form
      className={`space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-body shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
      {...rest}
    >
      {(title || description) && (
        <header className="space-y-1">
          {title && (
            <h2 className="text-title font-semibold text-slate-900 dark:text-slate-50">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-caption text-slate-600 dark:text-slate-400">
              {description}
            </p>
          )}
        </header>
      )}
      <div className="space-y-3">{children}</div>
    </form>
  );
};

