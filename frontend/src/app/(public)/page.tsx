import type { Metadata } from 'next';
import { HomePageClient } from '@/marketing/components/home/HomePageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'CAMS Services - Structured Mentoring & Intervention',
      description:
        'Premium mentoring and intervention for young people with evidence-based programmes, DBS-checked mentors, and transparent support pathways.',
      path: '/',
      imageAlt: 'CAMS Services',
    },
    BASE_URL
  );
}

export default function LandingPage() {
  return <HomePageClient />;
}
