'use client';

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  PoundSterling,
  FileText,
} from "lucide-react";
import { mockShifts } from "@/mock/trainerData";

export default function ShiftDetailPageClient() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const shift = mockShifts.find((s) => s.id === params.id);

  if (!shift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Shift not found
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            We could not find the shift you were looking for.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard/trainer/schedule")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to schedule
          </button>
        </div>
      </div>
    );
  }

  const approval = shift.approvalStatus;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <header className="bg-[#004E89] text-white px-4 sm:px-6 py-4 sm:py-5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 p-2"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex-1 min-w-0 text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-white/70">
              Shift info
            </p>
            <h1 className="text-lg sm:text-xl font-semibold truncate">
              {shift.position}
            </h1>
          </div>
          <div className="w-9" aria-hidden />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* SHIFT INFO */}
        <section aria-labelledby="shift-info-heading">
          <h2
            id="shift-info-heading"
            className="text-xs font-semibold tracking-[0.18em] text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl"
          >
            SHIFT INFO
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FFB627] text-white flex items-center justify-center font-semibold text-sm">
                {shift.assignee
                  .split(" ")
                  .map((s) => s[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("") || "TR"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {shift.assignee}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Assignee (you)
                </p>
              </div>
            </div>

            <div className="px-4 py-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <User className="h-4 w-4" aria-hidden />
                  <span>Position</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {shift.position}
                </span>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-between gap-4 text-left"
                onClick={() =>
                  router.push(`/dashboard/trainer/schedule/location/${shift.location.id}`)
                }
              >
                <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="h-4 w-4" aria-hidden />
                  <span>Location</span>
                </span>
                <span className="font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                  {shift.location.name}
                  <span aria-hidden>›</span>
                </span>
              </button>

              <div className="flex items-center justify-between gap-4">
                <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="h-4 w-4" aria-hidden />
                  <span>Time</span>
                </span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {shift.startTime}–{shift.endTime}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* WORK INFO */}
        <section aria-labelledby="work-info-heading">
          <h2
            id="work-info-heading"
            className="text-xs font-semibold tracking-[0.18em] text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl"
          >
            WORK INFO
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" aria-hidden />
                <span>Hours worked</span>
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {shift.hoursWorked ?? `${shift.startTime}–${shift.endTime}`}
              </span>
            </div>
            <button
              type="button"
              className="flex items-center justify-between px-4 py-3 text-left w-full"
            >
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" aria-hidden />
                <span>Clock history</span>
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-blue-700 dark:text-blue-300">
                {(shift.clockHistory ?? []).length} <span aria-hidden>›</span>
              </span>
            </button>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Clock className="h-4 w-4" aria-hidden />
                <span>Total hours worked</span>
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {shift.totalHoursWorked != null ? `${shift.totalHoursWorked.toFixed(2)}h` : "—"}
              </span>
            </div>
          </div>
        </section>

        {/* APPROVAL */}
        <section aria-labelledby="approval-heading">
          <h2
            id="approval-heading"
            className="text-xs font-semibold tracking-[0.18em] text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl"
          >
            APPROVAL
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4" aria-hidden />
                <span>Assignee (you)</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    approval?.assignee === "approved"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
                  }`}
                >
                  {approval?.assignee === "approved" ? "Approved" : "Pending"}
                </span>
                <CheckCircle2
                  className={`h-4 w-4 ${
                    approval?.assignee === "approved"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  aria-hidden
                />
              </span>
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <User className="h-4 w-4" aria-hidden />
                <span>Supervisor</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
                  {approval?.supervisor === "approved" ? "Approved" : "Awaiting approval"}
                </span>
                <CheckCircle2
                  className={`h-4 w-4 ${
                    approval?.supervisor === "approved"
                      ? "text-green-600 dark:text-green-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                  aria-hidden
                />
              </span>
            </div>
          </div>
        </section>

        {/* PAY */}
        <section aria-labelledby="pay-heading">
          <h2
            id="pay-heading"
            className="text-xs font-semibold tracking-[0.18em] text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl"
          >
            PAY
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800 text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <PoundSterling className="h-4 w-4" aria-hidden />
                <span>Rate</span>
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                £{shift.rate.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <PoundSterling className="h-4 w-4" aria-hidden />
                <span>Total pay</span>
              </span>
              <span className="font-semibold text-green-700 dark:text-green-400">
                £{shift.totalPay.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* SHIFT NOTES */}
        <section aria-labelledby="shift-notes-heading">
          <h2
            id="shift-notes-heading"
            className="text-xs font-semibold tracking-[0.18em] text-gray-600 dark:text-gray-300 uppercase bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-t-xl"
          >
            SHIFT NOTES
          </h2>
          <div className="bg-white dark:bg-gray-900 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left text-sm"
            >
              <span className="inline-flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <FileText className="h-4 w-4" aria-hidden />
                <span>Shift notes</span>
              </span>
              <span className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <span className="text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5">
                  {shift.notesCount ?? 0}
                </span>
                <span aria-hidden>›</span>
              </span>
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
