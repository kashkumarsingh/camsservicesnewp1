import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { OrganizationJsonLd } from '@/marketing/components/seo/OrganizationJsonLd';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { HOME_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Chaperone Service | CAMS Services',
      description:
        'Chaperone services and chaperone service UK for children in care, contact transport and SEND. DBS-checked escorts for schools and local authorities.',
      path: '/',
      imageAlt: SEO_DEFAULTS.ogImageAlt,
    },
    getMetadataBaseUrl()
  );
}

export default function LandingPage() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePageClient />
      <PageSeoProse
        eyebrow={HOME_SEO_PROSE.eyebrow}
        title={HOME_SEO_PROSE.title}
        paragraphs={HOME_SEO_PROSE.paragraphs}
        links={HOME_SEO_PROSE.links}
      />
    </>
  );
}
