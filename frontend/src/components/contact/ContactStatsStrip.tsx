'use client';

import React from 'react';
import { CONTACT_STATS } from './constants';

export default function ContactStatsStrip() {
  return (
    <div className="py-6 bg-white border-b border-slate-200">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {CONTACT_STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-card border border-slate-200 bg-slate-50/60 px-4 py-3 text-center"
            >
              <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
