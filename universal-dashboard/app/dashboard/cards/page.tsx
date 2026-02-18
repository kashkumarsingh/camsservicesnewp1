"use client";

import React from "react";
import { StatCard } from "@/components/cards/stat-card";
import { EmptyState } from "@/components/cards/empty-state";
import { LoadingSkeleton } from "@/components/common/loading-skeleton";
import { Button } from "@/components/common/button";

export default function CardsShowcasePage() {
  const [showSkeleton, setShowSkeleton] = React.useState(false);

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-display font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          Cards & states
        </h1>
        <p className="text-body text-slate-600 dark:text-slate-400">
          Stat cards, empty state, and loading skeleton. All mock.
        </p>
      </header>

      <div>
        <h2 className="mb-3 text-title font-semibold text-slate-900 dark:text-slate-50">
          Stat cards
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard value={128} label="Total items" trendLabel="+5% vs last week" trendVariant="up" />
          <StatCard value={45} label="Completed" trendLabel="+8% ↑" trendVariant="up" />
          <StatCard value={12} label="Pending" trendLabel="-2% ↓" trendVariant="down" />
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-title font-semibold text-slate-900 dark:text-slate-50">
          Empty state
        </h2>
        <EmptyState
          title="No results found"
          message="Try adjusting filters or add a new item to get started."
          action={<Button variant="primary" size="sm">Add item</Button>}
        />
      </div>

      <div>
        <h2 className="mb-3 text-title font-semibold text-slate-900 dark:text-slate-50">
          Loading skeleton
        </h2>
        <Button variant="secondary" size="sm" onClick={() => setShowSkeleton((s) => !s)} className="mb-3">
          {showSkeleton ? "Hide" : "Show"} skeleton
        </Button>
        {showSkeleton && (
          <div className="space-y-2">
            <LoadingSkeleton lines={3} />
            <LoadingSkeleton lines={5} />
          </div>
        )}
      </div>
    </section>
  );
}
