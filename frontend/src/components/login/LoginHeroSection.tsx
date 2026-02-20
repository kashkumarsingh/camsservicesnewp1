'use client';

import React from 'react';
import { Shield, Users, LayoutDashboard } from 'lucide-react';
import { LOGIN_HERO, LOGIN_FEATURES } from './constants';

const FEATURE_ICONS = [Shield, Users, LayoutDashboard] as const;

export default function LoginHeroSection() {
  return (
    <div className="lg:w-1/2">
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-navy-blue">
        {LOGIN_HERO.TITLE}
      </h1>
      <p className="mt-3 text-sm text-slate-600">{LOGIN_HERO.SUBTITLE}</p>

      <ul className="mt-10 space-y-6" role="list">
        {LOGIN_FEATURES.map((feature, index) => {
          const Icon = FEATURE_ICONS[index];
          return (
            <li key={feature.title} className="flex gap-4">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-blue/10 text-primary-blue"
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">{feature.title}</h2>
                <p className="mt-0.5 text-sm text-slate-600">{feature.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
