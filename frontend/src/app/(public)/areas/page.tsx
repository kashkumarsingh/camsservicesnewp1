import type { Metadata } from 'next';
import { AreasPageClient } from '@/marketing/components/areas/AreasPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone service by area | Chaperoning services West London',
      description:
        'Find chaperone service and chaperoning services in your borough: Ealing, Harrow, Brent, Hounslow, Hillingdon, Barnet and more. CAMS services — HQ Greenford, Ealing.',
      path: ROUTES.AREAS,
      imageAlt: 'CAMS services West London service areas',
    },
    BASE_URL
  );
}

export default function AreasPage() {
  return <AreasPageClient />;
}
