'use client';

import React from 'react';
import { Loader2, Shield } from 'lucide-react';
import { CALLBACK_LOADING } from './constants';

export default function CallbackLoadingCard() {
  return (
    <div className="rounded-card border-2 border-gray-200 bg-white p-8 shadow-2xl text-center md:p-12">
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full bg-gradient-to-r from-primary-blue to-light-blue-cyan opacity-20 animate-pulse" />
        </div>
        <Loader2 className="relative z-10 mx-auto h-24 w-24 animate-spin text-primary-blue" aria-hidden />
      </div>
      <h1 className="font-heading text-3xl font-bold text-navy-blue mb-3 md:text-4xl">
        {CALLBACK_LOADING.TITLE}
      </h1>
      <p className="text-lg text-gray-600 mb-6">{CALLBACK_LOADING.SUBTITLE}</p>
      <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
        <Shield className="h-4 w-4" aria-hidden />
        <span>{CALLBACK_LOADING.SECURE}</span>
      </div>
    </div>
  );
}
