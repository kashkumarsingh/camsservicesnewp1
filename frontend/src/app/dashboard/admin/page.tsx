import type { Metadata } from "next";
import React from "react";
import { AdminDashboardOverviewPageClient } from "./AdminDashboardOverviewPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Overview",
  description: "System overview across bookings, users and trainers.",
};

export default function AdminDashboardOverviewPage() {
  return <AdminDashboardOverviewPageClient />;
}
