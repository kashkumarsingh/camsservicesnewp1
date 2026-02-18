import type { Metadata } from "next";
import React from "react";
import { AdminUsersPageClient } from "./AdminUsersPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Users",
  description: "User management with an editable table.",
};

export default function AdminUsersPage() {
  return <AdminUsersPageClient />;
}

