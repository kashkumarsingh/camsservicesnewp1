'use client';

import React, { useMemo } from 'react';
import { getBlockComponent } from './blockRegistry';
import type { PageBlockDTO, PageBlockMetaDTO } from '@/core/application/pages/dto/PageDTO';

interface PageBlocksRendererProps {
  blocks: PageBlockDTO[];
}

function isBlockVisible(meta: PageBlockMetaDTO | null | undefined): boolean {
  if (!meta) return true;
  const now = Date.now();
  if (meta.visibleFrom) {
    const from = new Date(meta.visibleFrom).getTime();
    if (Number.isFinite(from) && now < from) return false;
  }
  if (meta.visibleUntil) {
    const until = new Date(meta.visibleUntil).getTime();
    if (Number.isFinite(until) && now > until) return false;
  }
  return true;
}

/**
 * Renders an ordered list of page builder blocks.
 * Phase 5: Analytics (data-block-type, data-block-id); visibility/scheduling (filter by date, hide on mobile).
 */
export default function PageBlocksRenderer({ blocks }: PageBlocksRendererProps) {
  const visibleBlocks = useMemo(() => {
    if (!blocks?.length) return [];
    return blocks.filter((block) => isBlockVisible(block.meta ?? undefined));
  }, [blocks]);

  if (!visibleBlocks.length) return null;

  return (
    <>
      {visibleBlocks.map((block, index) => {
        const Component = getBlockComponent(block.type);
        const blockId = block.id ?? `block-${index}`;
        const meta = block.meta;
        const hideOnMobile = meta?.hideOnMobile === true;

        return (
          <div
            key={blockId}
            data-block-type={block.type}
            data-block-id={blockId}
            {...(hideOnMobile ? { 'data-hide-on-mobile': 'true' } : {})}
            className={hideOnMobile ? 'hidden md:block' : undefined}
          >
            <Component
              blockType={block.type}
              payload={block.payload ?? {}}
            />
          </div>
        );
      })}
    </>
  );
}
