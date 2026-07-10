import type { Metadata } from 'next';
import { ChaperoneServicesPageClient } from '@/marketing/components/chaperone/ChaperoneServicesPageClient';
import { ChaperoneServicesJsonLd } from '@/marketing/components/seo/ChaperoneServicesJsonLd';
import { CHAPERONE_SERVICES_PAGE } from '@/marketing/content/chaperone-services-page';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: CHAPERONE_SERVICES_PAGE.metaTitle,
      description: CHAPERONE_SERVICES_PAGE.metaDescription,
      path: ROUTES.CHAPERONE_SERVICES,
      imageAlt: 'Chaperone services UK — CAMS services',
    },
    getMetadataBaseUrl()
  );
}

export default function ChaperoneServicesPage() {
  return (
    <>
      <ChaperoneServicesJsonLd />
      <ChaperoneServicesPageClient />
    </>
  );
}
