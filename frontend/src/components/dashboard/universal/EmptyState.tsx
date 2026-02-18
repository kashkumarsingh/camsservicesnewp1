'use client';

import React from 'react';

export interface EmptyStateProps {
  title: string;
  message: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  action,
  className = '',
}) => (
  <div
    className={
      'flex flex-col items-center justify-center space-y-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center dark:border-slate-700 dark:bg-slate-900 ' +
      className
    }
    role="status"
    aria-label={`${title}. ${message}`}
  >
    <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
      {title}
    </div>
    <p className="max-w-xs text-xs text-slate-600 dark:text-slate-400">
      {message}
    </p>
    {action && <div className="pt-1">{action}</div>}
  </div>
);
