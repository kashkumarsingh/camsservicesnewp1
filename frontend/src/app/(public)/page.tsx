import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { OrganizationJsonLd } from '@/marketing/components/seo/OrganizationJsonLd';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Child Transport & Family Support | CAMS Services',
      description:
        'Chaperone services UK, child transport services, family support services, community support services, SEND support services, foster placement support, residential care support, and mentoring services.',
      path: '/',
      imageAlt: 'CAMS Services',
    },
    getMetadataBaseUrl()
  );
}

export default function LandingPage() {
  return (
    <>
      <OrganizationJsonLd />
      <HomePageClient />
    </>
  );
}
