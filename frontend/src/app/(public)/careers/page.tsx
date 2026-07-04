import type { Metadata } from 'next';
import { CareersPageClient } from '@/marketing/components/careers/CareersPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Careers - CAMS Services',
      description: 'Join CAMS as a trainer and help young people build confidence and consistency.',
      path: ROUTES.CAREERS,
      imageAlt: 'Careers at CAMS Services',
    },
    BASE_URL
  );
}

export default function CareersPage() {
  return <CareersPageClient />;
}
