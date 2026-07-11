import type { ReactElement } from "react";
import { BUSINESS_HOURS, contactData } from "@/data/contactData";
import {
  BUSINESS_LEGAL_NAME,
  BUSINESS_NAP,
  BUSINESS_POSTAL_ADDRESS_SCHEMA,
} from "@/marketing/constants/businessNap";
import { getGbpYellPrimaryAreaEntries } from "@/marketing/content/local-seo";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS, CHAPERONE_SEO_TERMS } from "@/marketing/utils/seoConstants";
import { CAMS_SAME_AS_PROFILE_URLS } from "@/marketing/constants/socialLinks";

export function OrganizationJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const hqUrl = `${baseUrl}${BUSINESS_NAP.headquartersPath}`;
  const primaryAreas = getGbpYellPrimaryAreaEntries();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: BUSINESS_LEGAL_NAME,
        alternateName: SEO_DEFAULTS.siteName,
        url: baseUrl,
        logo: `${baseUrl}/logos/cams-services-logo.webp`,
        description: SEO_DEFAULTS.description,
        sameAs: [...CAMS_SAME_AS_PROFILE_URLS],
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
        name: BUSINESS_LEGAL_NAME,
        alternateName: SEO_DEFAULTS.siteName,
        url: baseUrl,
        telephone: contactData.phone,
        email: contactData.email,
        image: `${baseUrl}/logos/cams-services-logo.webp`,
        description: SEO_DEFAULTS.description,
        address: BUSINESS_POSTAL_ADDRESS_SCHEMA,
        hasMap: BUSINESS_NAP.mapsPlaceUrl,
        areaServed: [
          ...primaryAreas.map((area) => ({
            "@type": "AdministrativeArea",
            name: area.name,
            url: area.areaPageUrl,
          })),
          { "@type": "Country", name: "United Kingdom" },
        ],
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [...BUSINESS_HOURS.schema.dayOfWeek],
            opens: BUSINESS_HOURS.schema.opens,
            closes: BUSINESS_HOURS.schema.closes,
          },
        ],
        parentOrganization: { "@id": `${baseUrl}/#organization` },
        ...(primaryAreas.find((a) => a.isHeadquarters)
          ? {
              department: {
                "@type": "LocalBusiness",
                name: `${SEO_DEFAULTS.siteName} West London HQ`,
                url: hqUrl,
                address: BUSINESS_POSTAL_ADDRESS_SCHEMA,
              },
            }
          : {}),
      },
      {
        "@type": "ProfessionalService",
        "@id": `${baseUrl}/#chaperone-service`,
        name: `${SEO_DEFAULTS.siteName} chaperone services`,
        url: `${baseUrl}/chaperone-services`,
        provider: { "@id": `${baseUrl}/#organization` },
        areaServed: primaryAreas.map((area) => ({
          "@type": "AdministrativeArea",
          name: area.name,
          url: area.areaPageUrl,
        })),
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
