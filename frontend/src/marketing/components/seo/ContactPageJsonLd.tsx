import type { ReactElement } from "react";
import { contactData } from "@/data/contactData";
import { getMetadataBaseUrl } from "@/marketing/lib/public-site-url";
import { SEO_DEFAULTS } from "@/marketing/utils/seoConstants";

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
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "London" },
      { "@type": "AdministrativeArea", name: "Essex" },
      { "@type": "Country", name: "United Kingdom" },
    ],
    description:
      "Contact CAMS services for chaperone services, child transport, school transport support, youth mentoring and SEND support across London, Essex and the UK.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
