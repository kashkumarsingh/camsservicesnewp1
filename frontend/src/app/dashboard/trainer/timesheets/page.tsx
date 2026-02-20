import type { Metadata } from "next";
import { format, parseISO } from "date-fns";
import { Calendar, PoundSterling, Clock } from "lucide-react";
import { mockTimesheetEntries, mockPayPeriods } from "@/mock/trainerData";
import { EMPTY_STATE } from "@/utils/emptyStateConstants";

export const metadata: Metadata = {
  title: "Trainer Dashboard - Timesheets",
  description: "Overview of trainer timesheets and pay.",
};

export default function TrainerTimesheetsPage() {
  const entries = mockTimesheetEntries;
  const period = mockPayPeriods[0];

  const totalConfirmedHours = entries.reduce(
    (sum, e) => sum + e.confirmedHours,
    0,
  );
  const totalConfirmedPay = entries.reduce(
    (sum, e) => sum + e.confirmedPay,
    0,
  );

  const uniqueDates = Array.from(
    new Set(entries.map((e) => e.date)),
  ).sort((a, b) => (a < b ? -1 : 1));

  return (
    <section className="space-y-4 pb-12">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
            My timesheets
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Confirmed hours and pay for your recent work.
          </p>
        </div>
        <div className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
          <Clock className="h-5 w-5" aria-hidden />
        </div>
      </header>

      {/* Period summary */}
      {period && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="rounded-full bg-blue-50 dark:bg-blue-900/40 p-2 text-blue-700 dark:text-blue-300">
              <Calendar className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Period
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {period.period}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {format(parseISO(period.fromDate), "d MMM")} –{" "}
                {format(parseISO(period.toDate), "d MMM yyyy")}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/40 p-2 text-emerald-700 dark:text-emerald-300">
              <Clock className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Confirmed hours
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {totalConfirmedHours.toFixed(2)}h
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-3">
            <div className="rounded-full bg-emerald-50 dark:bg-emerald-900/40 p-2 text-emerald-700 dark:text-emerald-300">
              <PoundSterling className="h-5 w-5" aria-hidden />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Confirmed pay
              </p>
              <p className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                £{totalConfirmedPay.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Daily breakdown */}
      <div className="mt-4 space-y-3">
        {uniqueDates.map((date) => {
          const dayEntries = entries.filter((e) => e.date === date);
          const dayConfirmedHours = dayEntries.reduce(
            (sum, e) => sum + e.confirmedHours,
            0,
          );
          const dayConfirmedPay = dayEntries.reduce(
            (sum, e) => sum + e.confirmedPay,
            0,
          );

          return (
            <div
              key={date}
              className="rounded-xl bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {format(parseISO(date), "EEEE d MMMM yyyy")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {dayEntries.length} shift
                    {dayEntries.length !== 1 ? "s" : ""} ·{" "}
                    {dayConfirmedHours.toFixed(2)}h · £
                    {dayConfirmedPay.toFixed(2)}
                  </p>
                </div>
              </div>

              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {dayEntries.map((entry) => (
                  <li key={entry.id} className="px-4 py-3 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {entry.position}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {entry.location}
                      </p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {entry.confirmedHours.toFixed(2)}h
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        £{entry.confirmedPay.toFixed(2)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {uniqueDates.length === 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {EMPTY_STATE.NO_TIMESHEET_ENTRIES_YET.title}
          </p>
        )}
      </div>
    </section>
  );
}

