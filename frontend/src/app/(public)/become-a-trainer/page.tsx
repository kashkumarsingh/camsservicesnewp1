import type { Metadata } from 'next';
import { BecomeATrainerPageClient } from '@/marketing/components/trainers/BecomeATrainerPageClient';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { BECOME_A_TRAINER_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Become a Trainer - CAMS services',
      description:
        'Join CAMS as a trainer and receive curated family bookings based on your safeguarding profile and activity specialisms.',
      path: ROUTES.BECOME_A_TRAINER,
      imageAlt: 'Become a CAMS Trainer',
    },
    BASE_URL
  );
}

export default function BecomeATrainerPage() {
  return (
    <>
      <PublicPageSeoSection {...BECOME_A_TRAINER_SEO_PROSE} className="border-b border-slate-200" />
      <BecomeATrainerPageClient />
    </>
  );
}
