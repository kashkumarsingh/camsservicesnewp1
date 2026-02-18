import React from "react";

export interface StatCardProps {
  icon?: React.ReactNode;
  value: string | number;
  label: string;
  trendLabel?: string;
  trendVariant?: "up" | "down" | "neutral";
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  trendLabel,
  trendVariant = "neutral",
}) => {
  const trendClass =
    trendVariant === "up"
      ? "text-emerald-700"
      : trendVariant === "down"
        ? "text-rose-700"
        : "text-slate-600";

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 text-body shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-caption font-medium text-slate-500 dark:text-slate-400">
            {label}
          </div>
          <div className="mt-1 text-display font-semibold text-slate-900 dark:text-slate-50">
            {value}
          </div>
        </div>
        {icon && (
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-caption dark:bg-slate-800 dark:text-slate-100">
            {icon}
          </span>
        )}
      </div>
      {trendLabel && (
        <div className={`mt-2 text-micro ${trendClass}`}>{trendLabel}</div>
      )}
    </article>
  );
};

