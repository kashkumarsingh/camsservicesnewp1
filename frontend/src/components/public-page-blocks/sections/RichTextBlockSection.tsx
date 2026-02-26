'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import { RichTextBlock } from '@/components/shared/public-page';
import type { RichTextBlockPayload } from '../types';
import type { BlockSectionProps } from '../blockRegistry';

export default function RichTextBlockSection({ payload }: BlockSectionProps) {
  const p = payload as RichTextBlockPayload;
  const content = p?.content?.trim() ?? '';
  if (!content) return null;

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Section>
        <RichTextBlock
          content={content}
          proseClassName="prose prose-lg md:prose-xl max-w-4xl mx-auto text-navy-blue"
        />
      </Section>
    </div>
  );
}
