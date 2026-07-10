import type { ReactElement } from "react";
import { getLocationAreaBySlug } from "@/marketing/content/locations";
import {
  areaFocusKeywords,
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
        name: `Chaperone service ${area.name}`,
        alternateName: areaFocusKeywords(area),
        provider: {
          "@type": "LocalBusiness",
          name: SEO_DEFAULTS.siteName,
          url: baseUrl,
        },
        areaServed: {
          "@type": "AdministrativeArea",
          name: area.name,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: area.region,
          },
        },
        serviceType: [
          "Chaperone service",
          "Chaperone services",
          "Chaperoning services",
          "Child transport services",
          "School transport support",
        ],
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
