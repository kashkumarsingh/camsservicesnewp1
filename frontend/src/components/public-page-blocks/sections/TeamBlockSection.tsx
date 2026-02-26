'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Image from 'next/image';
import type { TeamBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function TeamBlockSection({ payload }: BlockSectionProps) {
  const p = payload as TeamBlockPayload;
  const items = p?.items ?? [];
  const title = p?.title?.trim();
  const subtitle = p?.subtitle?.trim();
  if (!items.length) return null;

  const validItems = items.filter((item) => item?.name?.trim());

  if (!validItems.length) return null;

  return (
    <Section
      className="py-16 bg-white dark:bg-slate-950"
      title={title ?? undefined}
      subtitle={subtitle ?? undefined}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {validItems.map((item, index) => (
          <div
            key={`${item.name}-${index}`}
            className="flex flex-col items-center text-center"
          >
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={160}
                height={160}
                className="rounded-full object-cover aspect-square border-2 border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-primary-blue/10 dark:bg-primary-blue/20 flex items-center justify-center text-2xl font-bold text-navy-blue dark:text-slate-200">
                {item.name.charAt(0).toUpperCase()}
              </div>
            )}
            <h3 className="mt-4 text-lg font-semibold text-navy-blue dark:text-slate-100">
              {item.name}
            </h3>
            {item.role?.trim() && (
              <p className="text-sm font-medium text-primary-blue dark:text-light-blue-cyan">
                {item.role}
              </p>
            )}
            {item.bio?.trim() && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
                {item.bio}
              </p>
            )}
          </div>
        ))}
      </div>
    </Section>
  );
}
