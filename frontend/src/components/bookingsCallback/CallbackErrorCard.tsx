'use client';

import React from 'react';
import Link from 'next/link';
import { XCircle, Home, Package } from 'lucide-react';
import { CALLBACK_ERROR } from './constants';
import type { CallbackErrorCardProps } from './callbackTypes';

export default function CallbackErrorCard({
  message,
  dashboardHref,
  packagesHref,
}: CallbackErrorCardProps) {
  return (
    <div className="rounded-card border-2 border-red-300 bg-white p-8 text-center shadow-2xl md:p-12">
      <div className="mb-6">
        <div className="inline-block rounded-full bg-red-100 p-4">
          <XCircle className="h-20 w-20 text-red-600" aria-hidden />
        </div>
      </div>
      <h1 className="font-heading text-3xl font-bold text-navy-blue mb-3 md:text-4xl">
        {CALLBACK_ERROR.TITLE}
      </h1>
      <p className="mx-auto mb-8 max-w-md text-lg text-gray-600">{message}</p>
      <div className="flex flex-col justify-center gap-3 sm:flex-row">
        <Link href={dashboardHref}>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-blue to-light-blue-cyan px-6 py-3 font-bold text-white shadow-lg transition-all hover:from-primary-blue/90 hover:to-light-blue-cyan/90 hover:shadow-xl"
          >
            <Home size={18} aria-hidden />
            {CALLBACK_ERROR.CTA_DASHBOARD}
            <span aria-hidden>→</span>
          </button>
        </Link>
        <Link href={packagesHref}>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-primary-blue to-light-blue-cyan px-5 py-3 font-bold text-white shadow-lg transition-all hover:from-primary-blue/90 hover:to-light-blue-cyan/90"
          >
            <Package size={18} aria-hidden />
            {CALLBACK_ERROR.CTA_BOOK_PACKAGE}
          </button>
        </Link>
      </div>
    </div>
  );
}
