import type { ReactElement } from "react";
import { BUSINESS_HOURS, contactData } from "@/data/contactData";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";
import { CAMS_SOCIAL_PROFILE_URLS } from "@/marketing/constants/socialLinks";

export function ContactPageJsonLd(): ReactElement {
  const baseUrl = getMetadataBaseUrl();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${baseUrl}/contact#localbusiness`,
    name: SEO_DEFAULTS.siteName,
    url: `${baseUrl}/contact`,
    telephone: contactData.phone,
    email: contactData.email,
    image: `${baseUrl}/logos/cams-services-logo.webp`,
    address: {
      "@type": "PostalAddress",
      streetAddress: "51 Eastmead Avenue",
      addressLocality: "Greenford",
      postalCode: "UB6 9RD",
      addressCountry: "GB",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [...BUSINESS_HOURS.schema.dayOfWeek],
        opens: BUSINESS_HOURS.schema.opens,
        closes: BUSINESS_HOURS.schema.closes,
      },
    ],
    areaServed: [
      { "@type": "City", name: "London" },
      { "@type": "AdministrativeArea", name: "Essex" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    description:
      "Contact CAMS services for chaperone services, child transport, school transport support, youth mentoring and SEND support across London, Essex and the UK.",
    sameAs: [...CAMS_SOCIAL_PROFILE_URLS],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
