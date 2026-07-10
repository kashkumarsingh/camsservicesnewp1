import type { ReactElement } from "react";
import { BUSINESS_HOURS } from "@/data/contactData";
import { getLocationAreaBySlug } from "@/marketing/content/locations";
import {
  areaFocusKeywords,
  areaJsonLdServiceTypes,
  areaMetaDescription,
  mergeAreaFaq,
} from "@/marketing/content/locations/location-seo-copy";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";

type AreaPageJsonLdProps = {
  slug: string;
};

export function AreaPageJsonLd({ slug }: AreaPageJsonLdProps): ReactElement | null {
  const area = getLocationAreaBySlug(slug);
  if (!area) return null;

  const baseUrl = getMetadataBaseUrl();
  const pageUrl = `${baseUrl}/areas/${area.slug}`;
  const keySample = area.keyAreas[0] ?? area.name;
  const faq = mergeAreaFaq(area, keySample);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${pageUrl}#service`,
        name: `Child support services in ${area.name}`,
        alternateName: areaFocusKeywords(area),
        provider: {
          "@type": "LocalBusiness",
          name: SEO_DEFAULTS.siteName,
          url: baseUrl,
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: [...BUSINESS_HOURS.schema.dayOfWeek],
              opens: BUSINESS_HOURS.schema.opens,
              closes: BUSINESS_HOURS.schema.closes,
            },
          ],
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: area.name,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: area.region,
          },
        },
        serviceType: areaJsonLdServiceTypes(),
        description: areaMetaDescription(area),
        url: pageUrl,
      },
      {
        "@type": "FAQPage",
        "@id": `${pageUrl}#faq`,
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: {
            "@type": "Answer",
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
