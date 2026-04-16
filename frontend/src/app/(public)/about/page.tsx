import type { Metadata } from 'next';
import { AboutPageClient } from '@/marketing/components/about/AboutPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'About - CAMS Services',
      description: '10+ years, 500+ families, and a trust-first intervention model.',
      path: ROUTES.ABOUT,
      imageAlt: 'About CAMS',
    },
    BASE_URL
  );
}

export default function AboutPage() {
  return <AboutPageClient />;
}
