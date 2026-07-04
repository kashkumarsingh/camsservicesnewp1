import type { Metadata } from 'next';
import { AboutPageClient } from '@/marketing/components/about/AboutPageClient';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { ABOUT_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'About - CAMS services',
      description: '10+ years, 500+ families, and a trust-first intervention model.',
      path: ROUTES.ABOUT,
      imageAlt: 'About CAMS',
    },
    BASE_URL
  );
}

export default function AboutPage() {
  return (
    <>
      <AboutPageClient />
      <PageSeoProse
        eyebrow={ABOUT_SEO_PROSE.eyebrow}
        title={ABOUT_SEO_PROSE.title}
        paragraphs={ABOUT_SEO_PROSE.paragraphs}
        links={ABOUT_SEO_PROSE.links}
      />
    </>
  );
}
