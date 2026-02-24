import type { Metadata } from "next";
import React from "react";
import ParentBookingsPageClient from "./ParentBookingsPageClient";

export const metadata: Metadata = {
  title: "Parent Dashboard - Booked hours and packages",
  description: "View and manage your booked hours and packages.",
};

export default function ParentBookingsPage() {
  return <ParentBookingsPageClient />;
}

