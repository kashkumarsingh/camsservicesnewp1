import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { AREAS_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered intro for /areas (crawlable word count). */
export function AreasSeoIntro(): ReactElement {
  return <PageSeoProse {...AREAS_INDEX_SEO_PROSE} headingId="areas-seo-intro-heading" />;
}
