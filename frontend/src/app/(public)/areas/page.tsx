import type { Metadata } from 'next';
import { AreasPageClient } from '@/marketing/components/areas/AreasPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Service areas | Chaperone, transport, mentoring & SEND support',
      description:
        'Chaperone service, child transport, youth mentoring, SEND support and family support by borough. Ealing, Harrow, Brent, Hounslow, Hillingdon, Barnet, Watford and more. CAMS services — HQ Greenford.',
      path: ROUTES.AREAS,
      imageAlt: 'CAMS services West London service areas',
    },
    BASE_URL
  );
}

export default function AreasPage() {
  return <AreasPageClient />;
}
