'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { TestimonialsBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function TestimonialsBlockSection({ payload }: BlockSectionProps) {
  const p = payload as TestimonialsBlockPayload;
  const items = p?.items ?? [];
  const title = p?.title?.trim();
  const subtitle = p?.subtitle?.trim();
  if (!items.length) return null;

  const validItems = items.filter((item) => item?.quote?.trim() && item?.authorName?.trim());

  if (!validItems.length) return null;

  return (
    <Section
      className="py-16 bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900/50 dark:to-slate-800/50"
      title={title ?? undefined}
      subtitle={subtitle ?? undefined}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {validItems.map((item, index) => {
          const initials = item.authorName.charAt(0).toUpperCase();
          return (
            <div
              key={`${item.authorName}-${index}`}
              className="rounded-card border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className="fill-star-gold text-star-gold"
                    size={16}
                  />
                ))}
              </div>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="mt-4 flex items-center gap-3">
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.authorName}
                    width={48}
                    height={48}
                    className="rounded-full object-cover aspect-square"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary-blue/20 flex items-center justify-center text-sm font-bold text-navy-blue dark:text-slate-200">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-navy-blue dark:text-slate-100">
                    {item.authorName}
                  </div>
                  {item.authorRole?.trim() && (
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {item.authorRole}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
