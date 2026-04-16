import type { Metadata } from 'next';
import { PackagesPageClient } from '@/marketing/components/packages/PackagesPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Packages - CAMS Services',
      description: 'Flexible mentoring and intervention packages for different levels of need.',
      path: ROUTES.PACKAGES,
      imageAlt: 'CAMS Intervention Packages',
    },
    BASE_URL
  );
}

export default function PackagesPage() {
  return <PackagesPageClient />;
}
