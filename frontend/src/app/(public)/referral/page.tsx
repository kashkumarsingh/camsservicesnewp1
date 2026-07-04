import type { Metadata } from 'next';
import { ReferralPageClient } from '@/marketing/components/referral/ReferralPageClient';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { REFERRAL_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Referral Partners | Local Authority Support Services | CAMS',
      description:
        'Refer chaperone services UK, child transport services, family support services, and SEND support services. Local authorities, schools, nurseries, foster agencies, and parents welcome.',
      path: ROUTES.REFERRAL,
      imageAlt: 'Referral with CAMS services',
    },
    BASE_URL
  );
}

export default function ReferralPage() {
  return (
    <>
      <PublicPageSeoSection {...REFERRAL_SEO_PROSE} className="border-b border-slate-200" />
      <ReferralPageClient />
    </>
  );
}
