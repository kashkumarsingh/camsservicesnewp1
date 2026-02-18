import Link from "next/link";
import { StatCard } from "@/components/cards/stat-card";

export default function DashboardOverviewPage() {
  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Component showcase
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Universal dashboard with mock data. Use the sidebar to see tables, forms, modals, toasts, and cards.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          value={4}
          label="Data table (sort, search, paginate)"
          trendLabel="With filters & row actions"
          trendVariant="neutral"
        />
        <StatCard
          value={2}
          label="Form examples"
          trendLabel="Validation + sections"
          trendVariant="neutral"
        />
        <StatCard
          value={3}
          label="Modals & toasts"
          trendLabel="Confirm, form, info + toast variants"
          trendVariant="neutral"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-3 text-title font-semibold text-slate-900 dark:text-slate-50">Go to</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/dashboard/tables"
            className="rounded-md bg-brand-600 px-3 py-1.5 text-caption font-medium text-white hover:bg-brand-700"
          >
            Tables
          </Link>
          <Link
            href="/dashboard/forms"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-caption font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Forms
          </Link>
          <Link
            href="/dashboard/modals"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-caption font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Modals & toasts
          </Link>
          <Link
            href="/dashboard/popovers"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-caption font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Popovers
          </Link>
          <Link
            href="/dashboard/calendar"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-caption font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Calendar
          </Link>
          <Link
            href="/dashboard/cards"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-caption font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Cards & states
          </Link>
        </div>
      </div>
    </section>
  );
}
