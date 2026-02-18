import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard - Settings",
  description: "System-wide configuration for the CAMS platform.",
};

export default function AdminSettingsPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          System settings
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Central place for configuration, feature flags and integration
          details.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Platform configuration
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This card will eventually host configuration forms built on the
            universal form components with Zod validation.
          </p>
        </div>

        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Integrations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stripe, email providers and any external integrations will surface
            status and configuration here.
          </p>
        </div>
      </div>
    </section>
  );
}

