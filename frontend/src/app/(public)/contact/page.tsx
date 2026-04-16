import type { Metadata } from 'next';
import { ContactPageClient } from '@/marketing/components/contact/ContactPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Contact - CAMS Services',
      description: 'Speak to CAMS and start a support pathway for your young person.',
      path: ROUTES.CONTACT,
      imageAlt: 'Contact CAMS Services',
    },
    BASE_URL
  );
}

export default function ContactPage() {
  return <ContactPageClient />;
}
