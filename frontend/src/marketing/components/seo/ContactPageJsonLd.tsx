import type { ReactElement } from "react";
import { BUSINESS_HOURS, contactData } from "@/data/contactData";
import {
  BUSINESS_LEGAL_NAME,
  BUSINESS_POSTAL_ADDRESS_SCHEMA,
} from "@/marketing/constants/businessNap";
import { getGbpYellPrimaryAreaEntries } from "@/marketing/content/local-seo";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";
import { CAMS_SAME_AS_PROFILE_URLS } from "@/marketing/constants/socialLinks";

export function ContactPageJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const primaryAreas = getGbpYellPrimaryAreaEntries();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/contact#localbusiness`,
    name: BUSINESS_LEGAL_NAME,
    alternateName: SEO_DEFAULTS.siteName,
    url: `${baseUrl}/contact`,
    telephone: contactData.phone,
    email: contactData.email,
    image: `${baseUrl}/logos/cams-services-logo.webp`,
    address: BUSINESS_POSTAL_ADDRESS_SCHEMA,
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...BUSINESS_HOURS.schema.dayOfWeek],
        opens: BUSINESS_HOURS.schema.opens,
        closes: BUSINESS_HOURS.schema.closes,
      },
    ],
    areaServed: [
      ...primaryAreas.map((area) => ({
        "@type": "AdministrativeArea",
        name: area.name,
        url: area.areaPageUrl,
      })),
      { "@type": "Country", name: "United Kingdom" },
    ],
    description:
      "Contact CAMS services for chaperone services, child transport, school transport support, youth mentoring and SEND support across London, Essex and the UK.",
    sameAs: [...CAMS_SAME_AS_PROFILE_URLS],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
