import type { Metadata } from "next";
import ShiftDetailPageClient from "./ShiftDetailPageClient";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Shift Detail",
  description: "Detailed view of a single trainer shift.",
};

export default function TrainerShiftDetailPage() {
  return <ShiftDetailPageClient />;
}
