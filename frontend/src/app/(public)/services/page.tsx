import type { Metadata } from 'next';
import { ServicesPageClient } from '@/marketing/components/services/ServicesPageClient';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: 'Our Services - CAMS Services',
      description:
        'Chaperone, transport, mentoring, SEND support, and tailored one-to-one packages for children, young people, families, and vulnerable adults.',
      path: ROUTES.SERVICES,
      imageAlt: 'CAMS Services Programmes',
    },
    BASE_URL
  );
}

export default function ServicesPage() {
  return <ServicesPageClient />;
}
