/**
 * Page Builder — block type slugs (single source of truth for frontend).
 * Must match backend config/page_blocks.php.
 *
 * @see PAGE_BUILDER_PHASE_PLAN.md
 */
export const PAGE_BLOCK_TYPES = [
  'hero',
  'features',
  'testimonials',
  'faq',
  'cta',
  'rich_text',
  'stats',
  'team',
] as const;

export type PageBlockType = (typeof PAGE_BLOCK_TYPES)[number];

/** Labels for block types (admin UI). */
export const BLOCK_TYPE_LABELS: Record<PageBlockType, string> = {
  hero: 'Hero',
  features: 'Features',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  cta: 'Call to Action',
  rich_text: 'Rich Text',
  stats: 'Stats',
  team: 'Team',
};
