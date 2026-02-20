'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2, FileText, Package, CreditCard, Home } from 'lucide-react';
import { formatCurrency } from '@/utils/currencyFormatter';
import { CALLBACK_CANCELED } from './constants';
import type { CallbackCanceledCardProps } from './callbackTypes';

function formatParticipantAge(dateOfBirth: string): string {
  try {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return ` (Age ${age})`;
  } catch {
    return '';
  }
}

export default function CallbackCanceledCard({
  loadingBooking,
  booking,
  paymentHref,
  dashboardHref,
}: CallbackCanceledCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FileText className="h-6 w-6 text-blue-600" aria-hidden />
          </div>
          <div className="flex-1">
            <h1 className="font-heading text-2xl font-bold text-navy-blue mb-1 md:text-3xl">
              {CALLBACK_CANCELED.TITLE}
            </h1>
            <p className="text-sm text-gray-600">{CALLBACK_CANCELED.SUBTITLE}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 md:p-8">
        {loadingBooking ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" aria-hidden />
            <span className="ml-2 text-sm text-gray-600">
              {CALLBACK_CANCELED.LOADING_BOOKING}
            </span>
          </div>
        ) : booking ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" aria-hidden />
                  <span className="font-semibold text-gray-900">
                    {booking.package?.name ?? CALLBACK_CANCELED.PACKAGE_LABEL}
                  </span>
                </div>
                {booking.participants && booking.participants.length > 0 && (() => {
                  const participant = booking.participants[0];
                  const childName = `${participant.firstName ?? ''} ${participant.lastName ?? ''}`.trim();
                  const ageDisplay = participant.dateOfBirth
                    ? formatParticipantAge(participant.dateOfBirth)
                    : '';
                  return (
                    <div className="text-sm text-gray-600">
                      {CALLBACK_CANCELED.FOR_LABEL} {childName}
                      {ageDisplay}
                    </div>
                  );
                })()}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-primary-blue">
                  {formatCurrency(booking.totalPrice ?? 0)}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="text-sm text-gray-600">{CALLBACK_CANCELED.NO_DETAILS}</div>
          </div>
        )}

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-5">
          <p className="text-base leading-relaxed text-gray-700">
            {CALLBACK_CANCELED.RECOVERY_MESSAGE}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={paymentHref} className="flex-1">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-blue to-light-blue-cyan px-6 py-3 font-semibold text-white shadow-md transition-all hover:from-primary-blue/90 hover:to-light-blue-cyan/90 hover:shadow-lg"
            >
              <CreditCard size={18} aria-hidden />
              {CALLBACK_CANCELED.CTA_COMPLETE_PAYMENT}
              <span aria-hidden>→</span>
            </button>
          </Link>
          <Link href={dashboardHref} className="flex-1">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 px-6 py-3 font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
            >
              <Home size={18} aria-hidden />
              {CALLBACK_CANCELED.CTA_DASHBOARD}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
