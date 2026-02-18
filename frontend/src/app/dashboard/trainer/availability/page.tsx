import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Availability",
  description: "Set your availability on the calendar.",
};

/**
 * Availability is set on the trainer dashboard calendar (single or multi date selection).
 * This route redirects to the dashboard.
 */
export default function TrainerAvailabilityPage() {
  redirect("/dashboard/trainer");
}
