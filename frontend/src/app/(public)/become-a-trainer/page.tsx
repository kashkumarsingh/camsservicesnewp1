import type { Metadata } from 'next';
import { BecomeATrainerPageClient } from '@/marketing/components/trainers/BecomeATrainerPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Become a Trainer - CAMS Services',
      description:
        'Join CAMS as a trainer and receive curated family bookings based on your safeguarding profile and activity specialisms.',
      path: ROUTES.BECOME_A_TRAINER,
      imageAlt: 'Become a CAMS Trainer',
    },
    BASE_URL
  );
}

export default function BecomeATrainerPage() {
  return <BecomeATrainerPageClient />;
}
