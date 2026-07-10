import { ROUTES } from '@/shared/utils/routes';
import type { PageSeoLink } from '@/marketing/components/seo/PageSeoProse';

export const CHAPERONE_SERVICES_PAGE = {
  metaTitle: 'Chaperone services UK | Professional chaperone service | CAMS services',
  metaDescription:
    'Chaperone services and chaperone service UK for children in care, SEND transport and contact centre journeys. DBS-checked escorts for schools, IFAs and local authorities. West London & UK.',
  heroEyebrow: 'Chaperone services',
  heroTitle: 'Professional chaperone services for children and young people',
  heroSubtitle:
    'Safeguarding-first chaperone service for contact transport, school runs, foster moves and community access. Commission CAMS services across West London and the wider UK.',
  paragraphs: [
    'CAMS services Ltd provides chaperone services when a child or young person cannot travel alone. Our chaperone service combines trained adult presence with planned journeys: supervised contact transport, SEMH-friendly school runs, foster placement moves and appointments.',
    'Unlike a taxi booking, a professional chaperone service is person-centred. The same DBS-checked practitioner can support multiple journeys in a week when continuity helps the child. Every assignment includes handover protocols, de-escalation awareness and reporting for referrers where commissioned.',
    'Local authorities, schools, foster agencies and families search for chaperone services near them when court-ordered contact, placement instability or SEND needs make independent travel unsafe. CAMS is headquartered in Greenford, Ealing, with chaperone services across West London boroughs and links into Hertfordshire and wider UK commissioning.',
    'We are a children\'s social care provider — not medical chaperoning, entertainment licensing or private VIP escorts. If you need chaperone services UK-wide for a child in care, contact centre transport or school attendance support, start with a referral or consultation.',
  ] as const,
  faq: [
    {
      q: 'What are chaperone services?',
      a: 'Chaperone services provide a trained, DBS-checked adult to accompany a child or young person on journeys or during supervised contact. The chaperone supports safeguarding, handovers and emotional regulation — not only driving from A to B.',
    },
    {
      q: 'What is the difference between chaperone services and chaperone service?',
      a: 'Both terms describe the same provision. Commissioners often use "chaperone services" in contracts and "chaperone service" in care plans. CAMS uses both phrases to match local authority templates.',
    },
    {
      q: 'Do you offer chaperone services near me?',
      a: 'CAMS delivers chaperone services across West London (Ealing, Hounslow, Hillingdon, Brent, Harrow, Barnet, Hammersmith and Fulham, Richmond) and Watford/Hertfordshire, with UK-wide commissioning for some referrals. See our service areas page for borough detail.',
    },
    {
      q: 'Who commissions chaperone services UK?',
      a: 'Children\'s services teams, IFAs, schools, SENCOs, foster agencies and parents commission chaperone services UK when travel must be supervised. CAMS accepts referrals with schedule, behaviour notes and handover instructions.',
    },
    {
      q: 'How is CAMS chaperone service different from standard transport?',
      a: 'Our chaperone service includes safeguarding-trained staff, defined handovers, journey documentation and the option to combine transport with mentoring through intervention packages.',
    },
  ] as const,
  links: [
    { href: ROUTES.SERVICE_BY_SLUG('community'), label: 'Community & transport programme' },
    { href: ROUTES.AREAS, label: 'Chaperone services by area' },
    { href: ROUTES.BLOG_POST_BY_SLUG('chaperone-services-uk'), label: 'Chaperone services UK guide' },
    { href: ROUTES.REFERRAL, label: 'Make a referral' },
    { href: ROUTES.CONTACT, label: 'Contact CAMS services' },
  ] as const satisfies readonly PageSeoLink[],
} as const;
