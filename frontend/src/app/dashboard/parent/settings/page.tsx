import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/dashboard/universal";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Parent Dashboard - Settings",
  description: "Manage parent account and notification settings.",
};

export default function ParentSettingsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Parent", href: "/dashboard/parent" },
            { label: "Settings" },
          ]}
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Account settings
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Update your details, preferences and notification settings from the
            user menu.
          </p>
        </div>
      </header>

      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 text-center">
        <Settings className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500 mb-3" aria-hidden />
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1">
          Settings are in the user menu
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-sm mx-auto">
          Click your name in the top-right corner, then choose <strong>Settings</strong> to
          update your profile and account details.
        </p>
        <Link
          href="/dashboard/parent"
          className="inline-flex items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    </section>
  );
}

