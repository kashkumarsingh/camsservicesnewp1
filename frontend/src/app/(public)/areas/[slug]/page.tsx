import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AreaLandingPageClient } from '@/marketing/components/areas/AreaLandingPageClient';
import { AreaSeoIntro } from '@/marketing/components/areas/AreaSeoIntro';
import { AreaPageJsonLd } from '@/marketing/components/seo/AreaPageJsonLd';
import { getLocationAreaBySlug, LOCATION_AREAS } from '@/marketing/content/locations';
import {
  areaMetaDescription,
  areaMetaTitle,
  mergeAreaFaq,
} from '@/marketing/content/locations/location-seo-copy';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export const revalidate = 1800;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return LOCATION_AREAS.map((area) => ({ slug: area.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const area = getLocationAreaBySlug(slug);
  if (!area) {
    return buildPublicMetadata(
      {
        title: 'Area not found',
        path: ROUTES.AREAS,
      },
      BASE_URL
    );
  }

  return buildPublicMetadata(
    {
      title: `${areaMetaTitle(area)} | CAMS services`,
      description: areaMetaDescription(area),
      path: ROUTES.AREA_BY_SLUG(area.slug),
      imageAlt: `Chaperone service and chaperoning services in ${area.name}`,
    },
    BASE_URL
  );
}

export default async function AreaLandingPage({ params }: Props) {
  const { slug } = await params;
  const area = getLocationAreaBySlug(slug);
  if (!area) notFound();

  const keySample = area.keyAreas[0] ?? area.name;
  const faq = mergeAreaFaq(area, keySample);

  return (
    <>
      <AreaPageJsonLd slug={slug} />
      <AreaSeoIntro area={area} />
      <AreaLandingPageClient area={area} faq={faq} />
    </>
  );
}
