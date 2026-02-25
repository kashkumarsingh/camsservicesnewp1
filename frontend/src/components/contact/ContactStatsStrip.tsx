'use client';

import React from 'react';
import { CONTACT_STATS } from './constants';

export default function ContactStatsStrip() {
  return (
    <div className="bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 text-center">
          {CONTACT_STATS.map((stat, index) => (
            <React.Fragment key={stat.label}>
              <div>
                <p className="text-4xl font-bold">{stat.value}</p>
                <p className="text-sm opacity-90">{stat.label}</p>
              </div>
              {index < CONTACT_STATS.length - 1 && (
                <div className="hidden sm:block w-px h-12 bg-white/30" aria-hidden="true" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
