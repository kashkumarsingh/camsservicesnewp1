import type { ReactElement } from 'react';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import type { ServiceLocationPageContent } from '@/marketing/content/locations/service-location-page-content';
import type { LocationArea } from '@/marketing/content/locations/types';
import { ROUTES } from '@/shared/utils/routes';
import { getServiceProgrammeBySlug } from '@/marketing/mock/services-programmes';

type ServiceLocationPageJsonLdProps = {
  area: LocationArea;
  serviceSlug: string;
  content: ServiceLocationPageContent;
};

export function ServiceLocationPageJsonLd({
  area,
  serviceSlug,
  content,
}: ServiceLocationPageJsonLdProps): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const programme = getServiceProgrammeBySlug(serviceSlug);
  const pageUrl = `${baseUrl}${ROUTES.AREA_SERVICE_BY_SLUG(area.slug, serviceSlug)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        name: content.heroTitle,
        description: content.metaDescription,
        url: pageUrl,
        areaServed: {
          '@type': 'AdministrativeArea',
          name: area.name,
        },
        provider: {
          '@type': 'Organization',
          name: 'CAMS services',
          url: baseUrl,
        },
        serviceType: content.focusPhrases,
      },
      {
        '@type': 'FAQPage',
        mainEntity: content.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Service areas',
            item: `${baseUrl}${ROUTES.AREAS}`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: area.name,
            item: `${baseUrl}${ROUTES.AREA_BY_SLUG(area.slug)}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: programme?.title ?? content.heroTitle,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
