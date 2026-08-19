import type { Metadata } from 'next';
import { ConnectPageClient } from '@/marketing/components/connect/ConnectPageClient';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { CONNECT_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'CAMS Services | Share, join or work with CAMS',
      description:
        'One CAMS link for WhatsApp, text and email. Become a CAMS Member, work with CAMS, refer a family or contact the team. Membership launches 20 September.',
      path: ROUTES.CONNECT,
      imageAlt: 'Share CAMS Services with families, referrers and local staff',
    },
    BASE_URL
  );
}

export default function ConnectPage() {
  return (
    <ConnectPageClient
      intro={<PublicPageSeoSection {...CONNECT_SEO_PROSE} headingId="connect-seo-intro-heading" />}
    />
  );
}
