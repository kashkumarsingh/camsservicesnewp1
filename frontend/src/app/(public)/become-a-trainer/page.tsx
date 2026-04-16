import type { Metadata } from 'next';
import { BecomeATrainerPageClient } from '@/marketing/components/trainers/BecomeATrainerPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

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
