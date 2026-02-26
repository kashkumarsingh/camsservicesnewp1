'use client';

import React from 'react';
import CTASection from '@/components/shared/CTASection';
import type { CtaBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function CtaBlockSection({ payload }: BlockSectionProps) {
  const p = payload as CtaBlockPayload;
  const title = p?.title?.trim() ?? '';
  const subtitle = p?.subtitle?.trim() ?? '';
  const primaryText = p?.primaryCtaText?.trim();
  const primaryHref = p?.primaryCtaHref?.trim();
  const secondaryText = p?.secondaryCtaText?.trim();
  const secondaryHref = p?.secondaryCtaHref?.trim();
  const variant = p?.variant ?? 'gradient';

  if (!title || !primaryText || !primaryHref) return null;

  return (
    <CTASection
      title={title}
      subtitle={subtitle}
      primaryCTA={{ text: primaryText, href: primaryHref }}
      secondaryCTA={
        secondaryText && secondaryHref ? { text: secondaryText, href: secondaryHref } : undefined
      }
      variant={variant === 'solid' || variant === 'gradient' ? variant : 'gradient'}
    />
  );
}
