import type { Metadata } from "next";
import React from "react";
import { AdminPublicPagesPageClient } from "./AdminPublicPagesPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Public Pages",
  description: "Shortcut from the admin dashboard to the public site page editor (CMS).",
};

export default function AdminPublicPagesPage() {
  return <AdminPublicPagesPageClient />;
}

