import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { SERVICES_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered intro for /services (crawlable text-HTML ratio). */
export function ServicesSeoIntro(): ReactElement {
  return <PageSeoProse {...SERVICES_INDEX_SEO_PROSE} headingId="services-seo-intro-heading" />;
}
