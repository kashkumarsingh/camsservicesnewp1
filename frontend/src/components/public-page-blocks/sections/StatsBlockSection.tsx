'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import { Star } from 'lucide-react';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { IMPACT_ICON_COLORS } from '@/components/home/constants';
import type { StatsBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function StatsBlockSection({ payload }: BlockSectionProps) {
  const p = payload as StatsBlockPayload;
  const items = p?.items ?? [];
  const title = p?.title?.trim();
  const subtitle = p?.subtitle?.trim();
  if (!items.length) return null;

  const validItems = items.filter((item) => item?.value != null || item?.label?.trim());

  if (!validItems.length) return null;

  return (
    <Section
      className="py-16 bg-slate-50 dark:bg-slate-900/50"
      title={title ?? undefined}
      subtitle={subtitle ?? undefined}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {validItems.map((item, index) => {
          const iconKey = item.icon?.toLowerCase() ?? 'star';
          const Icon = ICON_COMPONENT_MAP[iconKey] ?? Star;
          const iconColor = IMPACT_ICON_COLORS[index % IMPACT_ICON_COLORS.length];
          return (
            <div
              key={`${item.label}-${index}`}
              className="rounded-card border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900"
            >
              <Icon className={`${iconColor} mx-auto mb-2`} size={28} />
              <div className="text-2xl md:text-3xl font-bold text-navy-blue dark:text-slate-100">
                {item.value}
              </div>
              <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
