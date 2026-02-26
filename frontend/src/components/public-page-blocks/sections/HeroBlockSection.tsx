'use client';

import React from 'react';
import { PageHero } from '@/components/shared/public-page';
import Button from '@/components/ui/Button';
import type { HeroBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function HeroBlockSection({ payload }: BlockSectionProps) {
  const p = payload as HeroBlockPayload;
  const title = p?.title?.trim() ?? '';
  const subtitle = p?.subtitle?.trim() ?? '';
  if (!title) return null;

  return (
    <PageHero
      title={title}
      subtitle={subtitle}
      videoSrc={p?.videoSrc?.trim() || undefined}
    >
      {(p?.primaryCtaText?.trim() && p?.primaryCtaHref?.trim()) && (
        <>
          <Button
            href={p.primaryCtaHref}
            variant="superPlayful"
            size="lg"
            className="rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            withArrow
          >
            {p.primaryCtaText}
          </Button>
          {(p?.secondaryCtaText?.trim() && p?.secondaryCtaHref?.trim()) && (
            <Button
              href={p.secondaryCtaHref}
              variant="outline"
              size="lg"
              className="rounded-full bg-white text-primary-blue border-2 border-primary-blue shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
              withArrow
            >
              {p.secondaryCtaText}
            </Button>
          )}
        </>
      )}
    </PageHero>
  );
}
