import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Clients",
  description: "List of clients assigned to the trainer.",
};

export default function TrainerClientsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          My clients
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Browse the children and families you currently support, with quick
          access to progress and safeguarding history.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
          <p className="font-medium text-slate-700 dark:text-slate-200">
            No clients loaded yet
          </p>
          <p className="mt-1 text-xs">
            Once connected, this will reuse a shared client card pattern across
            parent and admin dashboards.
          </p>
        </div>
      </div>
    </section>
  );
}

