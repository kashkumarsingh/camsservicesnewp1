import type { Metadata } from "next";
import React from "react";
import ParentDashboardPageClient from "../ParentDashboardPageClient";

export const metadata: Metadata = {
  title: "Schedule - Parent Dashboard - CAMS Services",
  description: "Calendar and sessions for parents.",
};

/**
 * Parent Schedule: calendar only (no right sidebar).
 */
export default function ParentSchedulePage() {
  return <ParentDashboardPageClient />;
}
