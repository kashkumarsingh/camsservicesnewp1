import type { Metadata } from 'next';
import { ContactPageClient } from '@/marketing/components/contact/ContactPageClient';
import { ContactPageJsonLd } from '@/marketing/components/seo/ContactPageJsonLd';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { CONTACT_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Contact CAMS services | Chaperone Services UK | London & Essex',
      description:
        'Call +44 7939 990587 or send an enquiry. CAMS services Ltd, 51 Eastmead Avenue, Greenford UB6 9RD. Chaperone services, child transport and mentoring across London, Essex and the UK.',
      path: ROUTES.CONTACT,
      imageAlt: 'Contact CAMS services for chaperone and transport support',
    },
    BASE_URL
  );
}

export default function ContactPage() {
  return (
    <>
      <ContactPageJsonLd />
      <ContactPageClient
        intro={<PublicPageSeoSection {...CONTACT_SEO_PROSE} headingId="contact-seo-intro-heading" />}
      />
    </>
  );
}
