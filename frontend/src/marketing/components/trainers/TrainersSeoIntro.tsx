import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { TRAINERS_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered trainers copy for crawlers. Renders after the hero, not before it. */
export function TrainersSeoIntro(): ReactElement {
  return <PageSeoProse {...TRAINERS_INDEX_SEO_PROSE} headingId="trainers-seo-intro-heading" />;
}
