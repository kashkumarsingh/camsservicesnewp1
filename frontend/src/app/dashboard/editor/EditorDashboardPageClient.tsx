'use client';

import React from "react";
import Link from "next/link";

export const EditorDashboardPageClient: React.FC = () => {
  return (
    <section className="space-y-4">
      <header className="space-y-0.5">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
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
            Create, edit and publish marketing pages (home, about, policies and more).
          </p>
          <div className="mt-3">
            <Link
              href="/dashboard/admin/public-pages"
              className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-200"
            >
              Open public pages editor
            </Link>
          </div>
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

