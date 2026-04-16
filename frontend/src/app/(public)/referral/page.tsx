import type { Metadata } from 'next';
import { ReferralPageClient } from '@/marketing/components/referral/ReferralPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Referral - CAMS Services',
      description: 'Start a referral with CAMS and we will route your case to the right support pathway.',
      path: ROUTES.REFERRAL,
      imageAlt: 'Referral with CAMS Services',
    },
    BASE_URL
  );
}

export default function ReferralPage() {
  return <ReferralPageClient />;
}
