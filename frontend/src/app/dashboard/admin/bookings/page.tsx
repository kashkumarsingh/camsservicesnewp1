import type { Metadata } from "next";
import React from "react";
import { AdminBookingsPageClient } from "./AdminBookingsPageClient";

export const metadata: Metadata = {
  title: "Admin Dashboard - Bookings",
  description: "Global bookings management in an editable table.",
};

export default function AdminBookingsPage() {
  return <AdminBookingsPageClient />;
}
