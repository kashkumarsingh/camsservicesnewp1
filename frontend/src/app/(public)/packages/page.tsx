import type { Metadata } from 'next';
import { PackagesPageClient } from '@/marketing/components/packages/PackagesPageClient';
import { PackagesSeoIntro } from '@/marketing/components/packages/PackagesSeoIntro';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'CAMS Membership and monthly Support Subscriptions',
      description:
        'Mercury, Venus, Earth and Jupiter monthly membership from £75 to £270. 3 to 12 support hours. Pause paid support without losing CAMS Membership.',
      path: ROUTES.PACKAGES,
      imageAlt: 'CAMS Intervention Packages',
    },
    BASE_URL
  );
}

export default function PackagesPage() {
  return (
    <>
      <PackagesPageClient />
      <div className="sr-only">
        <PackagesSeoIntro />
      </div>
    </>
  );
}
