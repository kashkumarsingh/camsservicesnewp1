import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Progress",
  description: "Track progress for children you support.",
};

export default function TrainerProgressPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Progress tracking
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          This page will focus on activity logs, session outcomes and trends
          across the children you support.
        </p>
      </header>

      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The universal dashboard will host shared chart and timeline
          components, so trainers and parents see consistent progress views.
        </p>
      </div>
    </section>
  );
}

