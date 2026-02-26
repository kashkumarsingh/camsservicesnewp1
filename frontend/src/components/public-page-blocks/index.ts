/**
 * Page Builder — block renderer and registry for public pages.
 * @see PAGE_BUILDER_PHASE_PLAN.md
 */
export { default as PageBlocksRenderer } from './PageBlocksRenderer';
export { getBlockComponent, getAllBlockTypes } from './blockRegistry';
export type { BlockSectionProps } from './blockRegistry';
export type {
  HeroBlockPayload,
  RichTextBlockPayload,
  CtaBlockPayload,
  FaqBlockPayload,
  FeaturesBlockPayload,
  FeaturesBlockItem,
  StatsBlockPayload,
  StatsBlockItem,
  TeamBlockPayload,
  TeamBlockItem,
  TestimonialsBlockPayload,
  TestimonialsBlockItem,
} from './types';
