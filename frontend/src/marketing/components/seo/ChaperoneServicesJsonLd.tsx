import type { ReactElement } from 'react';
import { CHAPERONE_SERVICES_PAGE } from '@/marketing/content/chaperone-services-page';
import { getMetadataBaseUrl } from '@/marketing/lib/public-site-url';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { ROUTES } from '@/shared/utils/routes';

export function ChaperoneServicesJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const pageUrl = `${baseUrl}${ROUTES.CHAPERONE_SERVICES}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Service',
        '@id': `${pageUrl}#service`,
        name: 'Chaperone service',
        alternateName: ['Chaperone services', 'Chaperoning services', 'Chaperoning service', 'Chaperone services UK'],
        url: pageUrl,
        description: CHAPERONE_SERVICES_PAGE.metaDescription,
        provider: {
          '@type': 'LocalBusiness',
          name: SEO_DEFAULTS.siteName,
          url: baseUrl,
          address: {
            '@type': 'PostalAddress',
            streetAddress: '51 Eastmead Avenue',
            addressLocality: 'Greenford',
            addressRegion: 'London',
            postalCode: 'UB6 9RD',
            addressCountry: 'GB',
          },
        },
        areaServed: { '@type': 'Country', name: 'United Kingdom' },
        serviceType: ['Chaperone service', 'Chaperoning services', 'Chaperone services', 'Child transport', 'Contact centre transport'],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: CHAPERONE_SERVICES_PAGE.faq.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
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
