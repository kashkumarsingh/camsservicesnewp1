import type { Metadata } from "next";
import React from "react";
import { AdminPublicPagesPageClient } from "@/app/dashboard/admin/public-pages/AdminPublicPagesPageClient";

export const metadata: Metadata = {
  title: "Editor Dashboard - Public Pages",
  description: "Manage and publish public website pages as an editor.",
};

export default function EditorPublicPagesPage() {
  return <AdminPublicPagesPageClient />;
}

