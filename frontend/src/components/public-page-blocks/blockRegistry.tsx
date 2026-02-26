'use client';

import React from 'react';
import { PAGE_BLOCK_TYPES } from '@/utils/pageBuilderConstants';
import HeroBlockSection from './sections/HeroBlockSection';
import RichTextBlockSection from './sections/RichTextBlockSection';
import CtaBlockSection from './sections/CtaBlockSection';
import FaqBlockSection from './sections/FaqBlockSection';
import FeaturesBlockSection from './sections/FeaturesBlockSection';
import StatsBlockSection from './sections/StatsBlockSection';
import TeamBlockSection from './sections/TeamBlockSection';
import TestimonialsBlockSection from './sections/TestimonialsBlockSection';
import UnsupportedBlockSection from './sections/UnsupportedBlockSection';

export interface BlockSectionProps {
  blockType: string;
  payload: Record<string, unknown>;
}

type BlockComponent = React.ComponentType<BlockSectionProps>;

const REGISTRY: Partial<Record<string, BlockComponent>> = {
  hero: HeroBlockSection,
  rich_text: RichTextBlockSection,
  cta: CtaBlockSection,
  faq: FaqBlockSection,
  features: FeaturesBlockSection,
  testimonials: TestimonialsBlockSection,
  stats: StatsBlockSection,
  team: TeamBlockSection,
};

/**
 * Resolve component for a block type. Returns UnsupportedBlockSection for unknown types.
 */
export function getBlockComponent(blockType: string): BlockComponent {
  const component = REGISTRY[blockType];
  return component ?? UnsupportedBlockSection;
}

export function getAllBlockTypes(): readonly string[] {
  return PAGE_BLOCK_TYPES;
}
