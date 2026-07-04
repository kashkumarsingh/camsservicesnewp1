import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { POLICIES_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered intro for /policies (crawlable word count). Renders after the hero. */
export function PoliciesSeoIntro(): ReactElement {
  return <PageSeoProse {...POLICIES_INDEX_SEO_PROSE} headingId="policies-seo-intro-heading" />;
}
