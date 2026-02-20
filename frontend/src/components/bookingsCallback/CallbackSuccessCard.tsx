'use client';

import React from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Calendar,
  BookOpen,
  Clock,
  Home,
  Package,
} from 'lucide-react';
import { CALLBACK_SUCCESS } from './constants';
import type { CallbackSuccessCardProps } from './callbackTypes';

const SUCCESS_HEADER_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")";

export default function CallbackSuccessCard({
  message,
  bookingReference,
  bookingId,
  hasSessions,
  onCopyReference,
  dashboardHref,
  packagesHref,
}: CallbackSuccessCardProps) {
  return (
    <div className="overflow-hidden rounded-card border-2 border-green-300 bg-white shadow-2xl">
      <div className="relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 px-6 py-8 text-center">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: SUCCESS_HEADER_PATTERN }}
          aria-hidden
        />
        <div className="relative z-10">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <CheckCircle className="text-white" size={48} aria-hidden />
          </div>
          <h2 className="font-heading text-3xl font-bold text-white mb-2 md:text-4xl">
            {CALLBACK_SUCCESS.HEADING}
          </h2>
          <p className="text-lg text-green-50">{message}</p>
        </div>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        {bookingReference && (
          <div className="rounded-xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-blue">
                <Calendar className="h-5 w-5 text-white" aria-hidden />
              </div>
              <div>
                <h3 className="text-lg font-bold text-navy-blue">
                  {CALLBACK_SUCCESS.REFERENCE_TITLE}
                </h3>
                <p className="text-xs text-gray-600">{CALLBACK_SUCCESS.REFERENCE_HELP}</p>
              </div>
            </div>
            <div className="rounded-lg border-2 border-blue-300 bg-white p-4">
              <div className="text-center font-mono text-2xl font-extrabold tracking-wider text-primary-blue md:text-3xl">
                {bookingReference}
              </div>
              <button
                type="button"
                onClick={() => onCopyReference(bookingReference)}
                className="mt-3 w-full text-xs font-semibold text-gray-600 transition-colors hover:text-primary-blue"
              >
                {CALLBACK_SUCCESS.COPY_TO_CLIPBOARD}
              </button>
            </div>
          </div>
        )}

        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-blue">
              <CheckCircle className="text-white" size={20} aria-hidden />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-blue">
                {CALLBACK_SUCCESS.WHATS_NEXT_TITLE}
              </h3>
              <p className="text-xs text-gray-600">{CALLBACK_SUCCESS.WHATS_NEXT_SUBTITLE}</p>
            </div>
          </div>
          <div className="space-y-4">
            {!hasSessions ? (
              <div className="flex gap-4 rounded-lg border-2 border-blue-300 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-blue">
                  <BookOpen className="text-white" size={20} aria-hidden />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-navy-blue">
                    {CALLBACK_SUCCESS.BOOK_SESSIONS_TITLE}
                  </div>
                  <div className="text-sm text-gray-600">
                    {CALLBACK_SUCCESS.BOOK_SESSIONS_BODY}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 rounded-lg border-2 border-green-300 bg-white p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600">
                  <CheckCircle className="text-white" size={20} aria-hidden />
                </div>
                <div>
                  <div className="mb-1 font-semibold text-navy-blue">
                    {CALLBACK_SUCCESS.SESSIONS_BOOKED_TITLE}
                  </div>
                  <div className="text-sm text-gray-600">
                    {CALLBACK_SUCCESS.SESSIONS_BOOKED_BODY}
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-4 rounded-lg border border-purple-200 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-500">
                <Clock className="text-white" size={20} aria-hidden />
              </div>
              <div>
                <div className="mb-1 font-semibold text-navy-blue">
                  {CALLBACK_SUCCESS.CONFIRMATION_EMAIL_TITLE}
                </div>
                <div className="text-sm text-gray-600">
                  {CALLBACK_SUCCESS.CONFIRMATION_EMAIL_BODY}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {bookingId && !hasSessions && (
            <Link href={dashboardHref} className="block">
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-blue to-light-blue-cyan px-6 py-4 font-bold text-white shadow-lg transition-all hover:from-primary-blue/90 hover:to-light-blue-cyan/90 hover:shadow-xl"
              >
                <BookOpen size={20} aria-hidden />
                {CALLBACK_SUCCESS.CTA_BOOK_SESSIONS}
                <span aria-hidden>→</span>
              </button>
            </Link>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={dashboardHref}>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-primary-blue px-5 py-3 font-semibold text-primary-blue transition-all hover:bg-blue-50"
              >
                <Home size={18} aria-hidden />
                {CALLBACK_SUCCESS.CTA_DASHBOARD}
              </button>
            </Link>
            <Link href={packagesHref}>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-blue to-light-blue-cyan px-5 py-3 font-bold text-white shadow-lg transition-all hover:from-primary-blue/90 hover:to-light-blue-cyan/90"
              >
                <Package size={18} aria-hidden />
                {CALLBACK_SUCCESS.CTA_BOOK_ANOTHER}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
