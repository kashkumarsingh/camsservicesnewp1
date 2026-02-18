import type { Metadata } from "next";
import React from "react";
import { AdminParentsPageClient } from "./AdminParentsPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Parents",
  description: "Manage parent accounts, approvals, and linked children.",
};

export default function AdminParentsPage() {
  return <AdminParentsPageClient />;
}

