'use client';

import React from "react";

export const EditorDashboardPageClient: React.FC = () => {
  return (
    <section className="space-y-4">
      <header className="space-y-0.5">
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Editor dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Manage public website content, pages and messaging without touching operational data.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Public pages
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Public pages are maintained in the admin dashboard. Editor access is not enabled.
          </p>
        </div>

        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
          <h2 className="text-sm font-semibold">
            Blog & SEO content (coming next)
          </h2>
          <p className="mt-1 text-xs">
            This space is reserved for managing blog posts, SEO copy and FAQs.
            Implementation will plug into the same editor role once those endpoints are ready.
          </p>
        </div>
      </div>
    </section>
  );
};

