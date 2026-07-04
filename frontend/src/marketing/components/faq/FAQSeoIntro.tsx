import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { FAQ_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered FAQ intro for crawlers. Renders after the hero, not before it. */
export function FAQSeoIntro(): ReactElement {
  return <PageSeoProse {...FAQ_INDEX_SEO_PROSE} headingId="faq-seo-intro-heading" />;
}
