import type { Metadata } from "next";
import Link from "next/link";
import React from "react";

export const metadata: Metadata = {
  title: "Dashboard - Choose role",
  description:
    "Entry point into the universal dashboard for parents, trainers and admins.",
};

export default function DashboardEntryPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Choose your dashboard
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          In the final implementation this route will redirect automatically
          based on the signed-in user&apos;s role. For now, pick a dashboard
          to explore the universal shell.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/dashboard/parent"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
            Parent
          </span>
          <span className="mt-1 font-medium text-slate-900 dark:text-slate-50">
            Parent dashboard
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            View bookings, children and progress in one place.
          </span>
        </Link>

        <Link
          href="/dashboard/trainer"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-sky-600 dark:text-sky-400">
            Trainer
          </span>
          <span className="mt-1 font-medium text-slate-900 dark:text-slate-50">
            Trainer dashboard
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Manage sessions, availability and client progress.
          </span>
        </Link>

        <Link
          href="/dashboard/admin"
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Admin
          </span>
          <span className="mt-1 font-medium text-slate-900 dark:text-slate-50">
            Admin dashboard
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            System-level view across bookings, users and trainers.
          </span>
        </Link>
      </div>
    </section>
  );
}

