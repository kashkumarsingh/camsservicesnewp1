import type { Metadata } from 'next';
import { ReferralPageClient } from '@/marketing/components/referral/ReferralPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Referral Partners | Local Authority Support Services | CAMS',
      description:
        'Refer chaperone services UK, child transport services, family support services, and SEND support services. Local authorities, schools, nurseries, foster agencies, and parents welcome.',
      path: ROUTES.REFERRAL,
      imageAlt: 'Referral with CAMS Services',
    },
    BASE_URL
  );
}

export default function ReferralPage() {
  return <ReferralPageClient />;
}
