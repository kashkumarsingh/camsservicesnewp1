import type { Metadata } from "next";
import React from "react";
import { AdminReportsPageClient } from "./AdminReportsPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Reports",
  description: "Key metrics and export options for admin use.",
};

export default function AdminReportsPage() {
  return <AdminReportsPageClient />;
}

