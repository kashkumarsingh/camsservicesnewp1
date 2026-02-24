import type { Metadata } from "next";
import React from "react";
import { Breadcrumbs } from "@/components/dashboard/universal";
import ParentProgressPageClient from "./ParentProgressPageClient";

export const metadata: Metadata = {
  title: "Parent Dashboard - Progress",
  description: "View progress reports and recent session notes.",
};

export default function ParentProgressPage() {
  return (
    <section className="space-y-4">
      <header className="space-y-2">
        <Breadcrumbs
          items={[
            { label: "Parent", href: "/dashboard/parent" },
            { label: "Progress reports" },
          ]}
        />
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Progress reports
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            High-level view of your children&apos;s recent activities, notes and
            safeguarding updates.
          </p>
        </div>
      </header>

      <ParentProgressPageClient />
    </section>
  );
}

