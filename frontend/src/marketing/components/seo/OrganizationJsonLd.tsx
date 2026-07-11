import type { ReactElement } from "react";
import { BUSINESS_HOURS } from "@/data/contactData";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS, CHAPERONE_SEO_TERMS } from "@/marketing/utils/seoConstants";
import { CAMS_SOCIAL_PROFILE_URLS } from "@/marketing/constants/socialLinks";

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
        logo: `${baseUrl}/logos/cams-services-logo.webp`,
        description: SEO_DEFAULTS.description,
        sameAs: [...CAMS_SOCIAL_PROFILE_URLS],
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
        "@type": "LocalBusiness",
        "@id": `${baseUrl}/#localbusiness`,
        name: SEO_DEFAULTS.siteName,
        url: baseUrl,
        description: SEO_DEFAULTS.description,
        address: {
          "@type": "PostalAddress",
          streetAddress: "51 Eastmead Avenue",
          addressLocality: "Greenford",
          addressRegion: "London",
          postalCode: "UB6 9RD",
          addressCountry: "GB",
        },
        areaServed: { "@type": "Country", name: "United Kingdom" },
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [...BUSINESS_HOURS.schema.dayOfWeek],
            opens: BUSINESS_HOURS.schema.opens,
            closes: BUSINESS_HOURS.schema.closes,
          },
        ],
        parentOrganization: { "@id": `${baseUrl}/#organization` },
      },
      {
        "@type": "ProfessionalService",
        "@id": `${baseUrl}/#chaperone-service`,
        name: `${SEO_DEFAULTS.siteName} chaperone services`,
        url: `${baseUrl}/chaperone-services`,
        provider: { "@id": `${baseUrl}/#organization` },
        areaServed: {
          "@type": "Country",
          name: "United Kingdom",
        },
        serviceType: [
          CHAPERONE_SEO_TERMS.secondary,
          CHAPERONE_SEO_TERMS.primary,
          CHAPERONE_SEO_TERMS.chaperoning,
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
