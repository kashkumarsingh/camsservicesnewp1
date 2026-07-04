import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { HOME_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered home intro for crawlers. Renders before the final CTA. */
export function HomeSeoIntro(): ReactElement {
  return <PageSeoProse {...HOME_SEO_PROSE} titleAs="h2" headingId="home-seo-intro-heading" />;
}
