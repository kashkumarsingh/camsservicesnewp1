import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Chaperone Services UK | Child Transport & Family Support | CAMS Services',
      description:
        'Chaperone services UK, child transport services, family support services, community support services, SEND support services, foster placement support, residential care support, and mentoring services.',
      path: '/',
      imageAlt: 'CAMS Services',
    },
    BASE_URL
  );
}

export default function LandingPage() {
  return <HomePageClient />;
}
