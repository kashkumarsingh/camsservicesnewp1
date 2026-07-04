import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { ABOUT_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered intro for /about. Renders after the hero. */
export function AboutSeoIntro(): ReactElement {
  return <PageSeoProse {...ABOUT_SEO_PROSE} titleAs="h2" headingId="about-seo-intro-heading" />;
}
