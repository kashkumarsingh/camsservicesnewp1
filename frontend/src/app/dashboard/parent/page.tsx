import type { Metadata } from "next";
import React from "react";
import ParentOverviewPageClient from "./ParentOverviewPageClient";

export const metadata: Metadata = {
  title: "Parent Dashboard - CAMS Services",
  description: "Overview of bookings, children and progress for parents.",
};

/**
 * Parent dashboard Overview: hours, upcoming sessions, alerts, quick actions (content that was in the right sidebar).
 */
export default function ParentDashboardOverviewPage() {
  return <ParentOverviewPageClient />;
}

