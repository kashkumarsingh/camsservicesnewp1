import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { OrganizationJsonLd } from '@/marketing/components/seo/OrganizationJsonLd';
import { PageSeoProse } from '@/marketing/components/seo/PageSeoProse';
import { HOME_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Child Transport & Family Support | CAMS services',
      description:
        'Chaperone services UK, child transport services, family support services, community support services, SEND support services, foster placement support, residential care support, and mentoring services.',
      path: '/',
      imageAlt: 'CAMS services',
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
