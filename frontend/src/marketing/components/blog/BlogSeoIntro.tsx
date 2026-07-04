import type { ReactElement } from 'react';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { BLOG_INDEX_SEO_PROSE } from '@/marketing/content/page-seo-intros';

/** Server-rendered intro for /blog (crawlable text-HTML ratio). Renders between hero and article grid. */
export function BlogSeoIntro(): ReactElement {
  return <PageSeoProse {...BLOG_INDEX_SEO_PROSE} headingId="blog-seo-intro-heading" />;
}
