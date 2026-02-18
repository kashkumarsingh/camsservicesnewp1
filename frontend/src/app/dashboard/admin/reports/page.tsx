import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard - Reports",
  description: "Analytics and reporting for system-wide trends.",
};

export default function AdminReportsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Reports & analytics
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Placeholder for universal chart components and exportable reports.
        </p>
      </header>

      <div className="h-48 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500">
        <div className="flex h-full flex-col items-center justify-center gap-1">
          <span>Reports visualisation placeholder</span>
          <span>
            We will later introduce shared chart primitives here (bar, line,
            donut).
          </span>
        </div>
      </div>
    </section>
  );
}

