import type { Metadata } from "next";
import React from "react";
import { DashboardSyncLayout } from "@/app/dashboard/DashboardSyncLayout";

export const metadata: Metadata = {
  title: "Dashboard - CAMS Services",
  description:
    "Role-based dashboard experience for parents, trainers, and admins.",
};

export const dynamic = "force-dynamic";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardSyncLayout>{children}</DashboardSyncLayout>;
}

