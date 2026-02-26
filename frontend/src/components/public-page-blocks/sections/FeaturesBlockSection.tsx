'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { IMPACT_ICON_COLORS } from '@/components/home/constants';
import { Star } from 'lucide-react';
import type { FeaturesBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function FeaturesBlockSection({ payload }: BlockSectionProps) {
  const p = payload as FeaturesBlockPayload;
  const items = p?.items ?? [];
  const title = p?.title?.trim();
  const subtitle = p?.subtitle?.trim();
  if (!items.length) return null;

  const validItems = items.filter((item) => item?.title?.trim());

  if (!validItems.length) return null;

  return (
    <Section
      className="py-16 bg-white dark:bg-slate-950"
      title={title ?? undefined}
      subtitle={subtitle ?? undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {validItems.map((item, index) => {
          const iconKey = (item.icon ?? 'star').toLowerCase();
          const Icon = ICON_COMPONENT_MAP[iconKey] ?? Star;
          const iconColor = IMPACT_ICON_COLORS[index % IMPACT_ICON_COLORS.length];
          return (
            <div
              key={`${item.title}-${index}`}
              className="rounded-card border border-slate-200 bg-slate-50/50 p-6 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <Icon className={`${iconColor} mb-3`} size={28} />
              <h3 className="text-lg font-semibold text-navy-blue dark:text-slate-100">
                {item.title}
              </h3>
              {item.description?.trim() && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
