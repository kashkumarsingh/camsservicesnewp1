import type { Metadata } from "next";
import React from "react";
import { EditorDashboardPageClient } from "./EditorDashboardPageClient";

export const metadata: Metadata = {
  title: "Editor Dashboard - CAMS Services",
  description: "Workspace for managing public pages and website content.",
};

export default function EditorDashboardOverviewPage() {
  return <EditorDashboardPageClient />;
}

