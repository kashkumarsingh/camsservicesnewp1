import type { ReactElement } from "react";
import { getLocationAreaBySlug } from "@/marketing/content/locations";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";

type AreaPageJsonLdProps = {
  slug: string;
};

export function AreaPageJsonLd({ slug }: AreaPageJsonLdProps): ReactElement | null {
  const area = getLocationAreaBySlug(slug);
  if (!area) return null;

  const baseUrl = getMetadataBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Chaperone services in ${area.name}`,
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
      "Chaperone services",
      "Child transport services",
      "School transport support",
      "Youth mentoring",
    ],
    description: area.metaDescription,
    url: `${baseUrl}/areas/${area.slug}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
