import type { Metadata } from 'next';
import { ServicesPageClient } from '@/marketing/components/services/ServicesPageClient';
import { ServicesSeoIntro } from '@/marketing/components/services/ServicesSeoIntro';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Chaperone Service | CAMS Services',
      description:
        'Chaperone services and chaperone service UK for children in care, contact transport and SEND. Child transport, school runs, contact centre escorts and mentoring.',
      path: ROUTES.SERVICES,
      imageAlt: 'CAMS services Programmes',
    },
    BASE_URL
  );
}

export default function ServicesPage() {
  return (
    <>
      <ServicesPageClient />
      <div className="sr-only">
        <ServicesSeoIntro />
      </div>
    </>
  );
}
