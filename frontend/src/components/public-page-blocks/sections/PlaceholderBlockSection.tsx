'use client';

import React from 'react';
import type { BlockSectionProps } from '../blockRegistry';

/**
 * Placeholder for block types (features, testimonials, stats, team) until section components exist.
 * Renders nothing in production; in dev shows block type for debugging.
 */
export default function PlaceholderBlockSection({ blockType }: BlockSectionProps) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <section className="py-6 px-4 border border-dashed border-gray-300 rounded-lg max-w-4xl mx-auto my-2">
      <p className="text-xs text-gray-500">
        Block: <code className="font-mono">{blockType}</code> (placeholder)
      </p>
    </section>
  );
}
