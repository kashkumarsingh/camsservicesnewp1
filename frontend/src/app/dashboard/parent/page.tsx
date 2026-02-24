import type { Metadata } from "next";
import React from "react";
import ParentDashboardPageClient from "./ParentDashboardPageClient";

export const metadata: Metadata = {
  title: "Parent Dashboard - CAMS Services",
  description: "Overview of bookings, children and progress for parents.",
};

/**
 * Parent dashboard Overview: three-column calendar layout (left: mini calendar, upcoming sessions, my children; center: scheduled sessions; right: hours, per child, pending actions).
 */
export default function ParentDashboardOverviewPage() {
  return <ParentDashboardPageClient />;
}

