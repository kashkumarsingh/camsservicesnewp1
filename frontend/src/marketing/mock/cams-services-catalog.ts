/** Central catalogue for CAMS service offerings, audiences, and referral partners. */

export const COMPANY_TAGLINE =
  "Trusted Chaperone, Transport, Mentoring and Support Services" as const;

export const COMPANY_KEY_MESSAGE = [
  "Safe.",
  "Reliable.",
  "Consistent.",
  "Tailored to individual needs.",
] as const;

/** Priority search terms for titles and on-page copy (not meta keywords tags). */
export const CAMS_GOOGLE_SEARCH_TERMS = [
  "Chaperone Services UK",
  "Child Transport Services",
  "Family Support Services",
  "Community Support Services",
  "SEND Support Services",
  "Foster Placement Support",
  "Contact Centre Transport",
  "Child Escort Services",
  "Mentoring Services",
  "Local Authority Support Services",
  "School Transport Support",
  "Residential Care Support",
] as const;

export const CAMS_SERVICES_LIST: readonly string[] = [
  "Chaperone and Transport Support",
  "School Transport Support",
  "Community Support Services",
  "Contact Centre Transport",
  "Family Support Services",
  "Mentoring Services",
  "SEND Support Services",
  "Foster Placement Support",
  "Residential Care Support",
  "Accompanied Appointments",
  "Respite and Short Break Support",
  "Emergency Transport Arrangements",
  "Placement Transition Support",
  "Activity and Wellbeing Support",
  "Appropriate Adult Support (subject to training and local authority requirements)",
  "Tailored One-to-One Support Packages",
] as const;

export const WHO_WE_SUPPORT_LIST: readonly string[] = [
  "Children and Young People",
  "Families",
  "Foster Carers",
  "Children in Care",
  "Residential Children's Homes",
  "SEND Services",
  "Local Authorities",
  "Schools and Nurseries",
  "Social Care Teams",
  "Youth Services",
  "Vulnerable Adults",
  "Community Organisations",
] as const;

export const TRANSPORT_SUPPORT_INTRO =
  "CAMS Services provides safe and reliable child transport services across the UK, including school transport support, contact centre transport, foster placement journeys, and child escort services for children, young people, and vulnerable individuals." as const;

export const TRANSPORT_SUPPORT_ITEMS: readonly string[] = [
  "School Transport Support",
  "Home to Nursery Transport",
  "Contact Centre Transport",
  "Foster Placement Transport",
  "Community Access Transport",
  "Child Escort Services",
  "Supported Travel and Transition Services",
] as const;

export const TRANSPORT_SUPPORT_FOOTNOTE =
  "All journeys are planned around the individual's needs and carried out in accordance with safeguarding procedures." as const;

export const REFERRAL_PARTNERS_LIST: readonly string[] = [
  "Local Authorities",
  "Children's Services",
  "Social Workers",
  "Schools",
  "Nurseries",
  "Foster Agencies",
  "Residential Children's Homes",
  "Family Support Teams",
  "SEND Teams",
  "Parents and Guardians",
] as const;

export const HOME_INTRO_PARAGRAPHS: readonly string[] = [
  "CAMS Services Ltd provides chaperone services UK-wide for children, young people, families, and vulnerable adults.",
  "We work alongside local authorities, schools, nurseries, foster carers, residential homes, and community organisations to deliver family support services, community support services, and local authority support services that are safe, reliable, and person-centred.",
  "From child transport services and school transport support to SEND support services, foster placement support, residential care support, and mentoring services, every package is designed around the individual's needs, circumstances, and goals.",
] as const;

export const CAMS_CONTACT = {
  phone: "+44 7939 990587",
  email: "info@camsservices.co.uk",
} as const;

export function camsTelHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, "")}`;
}
