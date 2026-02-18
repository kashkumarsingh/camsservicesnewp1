import type { Metadata } from "next";
import React from "react";
import TrainerDashboardPageClient from "./TrainerDashboardPageClient";

export const metadata: Metadata = {
  title: "Trainer Dashboard - CAMS Services",
  description: "Overview of trainer schedule, sessions and recent activity.",
};

/**
 * Trainer dashboard inside the universal dashboard shell.
 * Renders the real CAMS trainer dashboard (schedule, sessions, bookings).
 */
export default function TrainerDashboardOverviewPage() {
  return <TrainerDashboardPageClient />;
}

