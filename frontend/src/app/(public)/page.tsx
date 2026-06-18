import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'CAMS Services - Trusted Chaperone, Transport, Mentoring & Support',
      description:
        'Tailored support services for children, young people, families, and vulnerable adults. Safe, reliable, and person-centred.',
      path: '/',
      imageAlt: 'CAMS Services',
    },
    BASE_URL
  );
}

export default function LandingPage() {
  return <HomePageClient />;
}
