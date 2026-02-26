'use client';

import React from 'react';
import type { BlockSectionProps } from '../blockRegistry';

/**
 * Renders when block type has no registered component (dev visibility; optional in production).
 */
export default function UnsupportedBlockSection({ blockType }: BlockSectionProps) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <section className="py-8 px-4 border border-amber-200 bg-amber-50/50 rounded-lg max-w-4xl mx-auto my-4">
      <p className="text-sm text-amber-800">
        Unsupported block type: <code className="font-mono">{blockType}</code>
      </p>
    </section>
  );
}
