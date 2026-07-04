import type { Metadata } from 'next';
import { ContactPageClient } from '@/marketing/components/contact/ContactPageClient';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { CONTACT_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Contact - CAMS services',
      description: 'Speak to CAMS and start a support pathway for your young person.',
      path: ROUTES.CONTACT,
      imageAlt: 'Contact CAMS services',
    },
    BASE_URL
  );
}

export default function ContactPage() {
  return (
    <>
      <PublicPageSeoSection {...CONTACT_SEO_PROSE} className="border-b border-slate-200" />
      <ContactPageClient />
    </>
  );
}
