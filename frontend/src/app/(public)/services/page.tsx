import type { Metadata } from 'next';
import { ServicesPageClient } from '@/marketing/components/services/ServicesPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK, Child Transport & SEND Support | CAMS Services',
      description:
        'Child transport services, school transport support, contact centre transport, child escort services, family support services, community support services, SEND support services, foster placement support, and residential care support.',
      path: ROUTES.SERVICES,
      imageAlt: 'CAMS Services Programmes',
    },
    BASE_URL
  );
}

export default function ServicesPage() {
  return <ServicesPageClient />;
}
