import type { ReactElement } from "react";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";

export function OrganizationJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_DEFAULTS.siteName,
    url: baseUrl,
    logo: `${baseUrl}/og`,
    description: SEO_DEFAULTS.description,
    sameAs: [] as string[],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
