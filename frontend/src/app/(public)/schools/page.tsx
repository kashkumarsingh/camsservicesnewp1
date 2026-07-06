import type { Metadata } from 'next';
import { SchoolsPageClient } from '@/marketing/components/schools/SchoolsPageClient';
import { PublicPageSeoSection } from '@/marketing/components/seo/PublicPageSeoSection';
import { SCHOOLS_SEO_PROSE } from '@/marketing/content/page-seo-intros';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';
import { SCHOOLS_PAGE } from '@/app/(public)/constants/schoolsPageConstants';

const BASE_URL = getMetadataBaseUrl();

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: SCHOOLS_PAGE.META_TITLE,
      description: SCHOOLS_PAGE.META_DESCRIPTION,
      path: ROUTES.SCHOOLS,
      imageAlt: 'School partnerships with CAMS services',
    },
    BASE_URL
  );
}

export default function SchoolsPage() {
  return (
    <SchoolsPageClient
      intro={<PublicPageSeoSection {...SCHOOLS_SEO_PROSE} headingId="schools-seo-intro-heading" />}
    />
  );
}
