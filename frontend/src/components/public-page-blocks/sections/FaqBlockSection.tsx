'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import FAQAccordion from '@/components/features/faq/FAQAccordion';
import type { FaqBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function FaqBlockSection({ payload }: BlockSectionProps) {
  const p = payload as FaqBlockPayload;
  const items = p?.items ?? [];
  const title = p?.title?.trim();
  const description = p?.description?.trim();
  if (!items.length) return null;

  const faqs = items.map((item) => ({
    question: item?.question ?? '',
    answer: item?.answer ?? '',
    category: item?.category,
  })).filter((f) => f.question || f.answer);

  if (!faqs.length) return null;

  return (
    <Section>
      <FAQAccordion
        faqs={faqs}
        title={title ?? undefined}
        description={description ?? undefined}
      />
    </Section>
  );
}
