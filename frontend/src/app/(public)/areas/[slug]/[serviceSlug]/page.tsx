import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ServiceLocationPageClient } from '@/marketing/components/areas/ServiceLocationPageClient';
import { ServiceLocationPageJsonLd } from '@/marketing/components/seo/ServiceLocationPageJsonLd';
import { getLocationAreaBySlug } from '@/marketing/content/locations';
import {
  buildServiceLocationPageContent,
  getServiceLocationPairs,
  isValidAreaServicePair,
} from '@/marketing/content/locations/service-location-page-content';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { ROUTES } from '@/shared/utils/routes';

const BASE_URL = getMetadataBaseUrl();

export const revalidate = 1800;

type Props = {
  params: Promise<{ slug: string; serviceSlug: string }>;
};

export async function generateStaticParams(): Promise<
  Array<{ slug: string; serviceSlug: string }>
> {
  return getServiceLocationPairs().map((pair) => ({
    slug: pair.areaSlug,
    serviceSlug: pair.serviceSlug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, serviceSlug } = await params;
  const area = getLocationAreaBySlug(slug);
  if (!area || !isValidAreaServicePair(area, serviceSlug)) {
    return buildPublicMetadata({ title: 'Not found', path: ROUTES.AREAS }, BASE_URL);
  }

  const content = buildServiceLocationPageContent(area, serviceSlug);
  if (!content) {
    return buildPublicMetadata({ title: 'Not found', path: ROUTES.AREAS }, BASE_URL);
  }

  return buildPublicMetadata(
    {
      title: `${content.metaTitle} | CAMS services`,
      description: content.metaDescription,
      path: ROUTES.AREA_SERVICE_BY_SLUG(slug, serviceSlug),
      imageAlt: `${content.heroTitle}, CAMS services`,
      areaName: area.name,
    },
    BASE_URL
  );
}

export default async function ServiceLocationPage({ params }: Props) {
  const { slug, serviceSlug } = await params;
  const area = getLocationAreaBySlug(slug);
  if (!area || !isValidAreaServicePair(area, serviceSlug)) notFound();

  const content = buildServiceLocationPageContent(area, serviceSlug);
  if (!content) notFound();

  return (
    <>
      <ServiceLocationPageJsonLd area={area} serviceSlug={serviceSlug} content={content} />
      <ServiceLocationPageClient area={area} serviceSlug={serviceSlug} content={content} />
    </>
  );
}
