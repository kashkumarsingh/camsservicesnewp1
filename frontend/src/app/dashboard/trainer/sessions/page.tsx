import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Sessions",
  description: "Record and review trainer-led sessions.",
};

export default function TrainerSessionsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Sessions
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Table-based view of sessions you have delivered, suitable for inline
          editing and note-taking.
        </p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <p>
          We will reuse the universal data table component here with inline
          editing for attendance, notes and outcomes.
        </p>
      </div>
    </section>
  );
}

