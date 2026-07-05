import type { ReactElement } from "react";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS, CHAPERONE_SEO_TERMS } from "@/marketing/utils/seoConstants";

export function OrganizationJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: SEO_DEFAULTS.siteName,
        url: baseUrl,
        logo: `${baseUrl}/og`,
        description: SEO_DEFAULTS.description,
        sameAs: [] as string[],
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: SEO_DEFAULTS.siteName,
        description: SEO_DEFAULTS.description,
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "en-GB",
      },
      {
        "@type": "ProfessionalService",
        "@id": `${baseUrl}/#chaperone-service`,
        name: `${SEO_DEFAULTS.siteName} chaperone services`,
        url: `${baseUrl}/blog/chaperone-services-uk`,
        provider: { "@id": `${baseUrl}/#organization` },
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
        serviceType: [
          CHAPERONE_SEO_TERMS.secondary,
          CHAPERONE_SEO_TERMS.primary,
          CHAPERONE_SEO_TERMS.branded,
          "child transport services",
          "contact centre transport",
          "school transport support",
        ],
        description:
          "Safeguarding-first chaperone service and chaperone services for children and young people, including supervised contact transport, school runs and foster placement journeys.",
        knowsAbout: [
          "Chaperone services UK",
          "Child escort services",
          "Supervised contact transport",
          "SEND school transport",
          "Children in care",
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
