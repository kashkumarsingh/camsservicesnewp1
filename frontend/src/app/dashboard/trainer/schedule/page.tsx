import type { Metadata } from "next";
import React from "react";
import { CalendarCheck } from "lucide-react";
import { ScheduleListView } from "@/components/trainer/ScheduleListView";
import { mockAvailability, mockShifts } from "@/mock/trainerData";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Schedule",
  description: "Day-grouped schedule view of trainer shifts.",
};

export default function TrainerSchedulePage() {
  return (
    <section className="space-y-4 pb-12">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            Schedule
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Day-grouped list of your upcoming shifts and unavailable days.
          </p>
        </div>
        <div className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <CalendarCheck className="h-5 w-5" aria-hidden />
        </div>
      </header>

      <ScheduleListView
        shifts={mockShifts}
        availability={mockAvailability}
        viewMode="schedule"
        // Trainer context uses the default trainer schedule base path.
      />
    </section>
  );
}

