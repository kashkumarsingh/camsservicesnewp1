import type { Metadata } from 'next';
import { AreasPageClient } from '@/marketing/components/areas/AreasPageClient';
import { AreasSeoIntro } from '@/marketing/components/areas/AreasSeoIntro';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Service areas | Chaperone, transport, mentoring & SEND support',
      description:
        'Twenty-five CAMS services area hubs across Greater London, Essex, Hertfordshire and Berkshire. Chaperone service, child transport, mentoring and SEND support from HQ Greenford, Ealing.',
      path: ROUTES.AREAS,
      imageAlt: 'CAMS services borough and county service areas map',
    },
    BASE_URL
  );
}

export default function AreasPage() {
  return (
    <>
      <AreasPageClient />
      <div className="sr-only">
        <AreasSeoIntro />
      </div>
    </>
  );
}
