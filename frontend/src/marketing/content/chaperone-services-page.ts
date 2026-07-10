import { ROUTES } from '@/shared/utils/routes';
import type { PageSeoLink } from '@/marketing/components/seo/PageSeoProse';

export const CHAPERONE_SERVICES_PAGE = {
  metaTitle: 'Chaperone service UK | Chaperoning services & chaperone services',
  metaDescription:
    'Chaperone service, chaperoning services and chaperone services UK for children in care, SEND transport and contact centre journeys. DBS-checked escorts. West London boroughs & UK.',
  heroEyebrow: 'Chaperone service & chaperoning services',
  heroTitle: 'Chaperone service and chaperoning services for children',
  heroSubtitle:
    'Safeguarding-first chaperone service for contact transport, school runs, foster moves and community access — chaperoning services across West London boroughs and the wider UK.',
  paragraphs: [
    'CAMS services Ltd provides chaperone service when a child or young person cannot travel alone. Our chaperoning services combine trained adult presence with planned journeys: supervised contact transport, SEMH-friendly school runs, foster placement moves and appointments.',
    'People search chaperone service, chaperone services, or chaperoning services near their borough when court-ordered contact, placement instability or SEND needs make independent travel unsafe. Unlike a taxi, our chaperone service is person-centred with handover protocols and de-escalation support.',
    'Local authorities, schools, foster agencies and families commission chaperoning services across West London — Ealing, Hounslow, Hillingdon, Brent, Harrow, Barnet and more — from our Greenford HQ, with UK-wide delivery by arrangement.',
    'We provide children\'s social care chaperoning only — not medical chaperoning, entertainment licensing or private VIP escorts. Find chaperone service in your area on our borough pages, or submit a referral to confirm capacity.',
  ] as const,
  faq: [
    {
      q: 'What is chaperone service?',
      a: 'Chaperone service is a trained, DBS-checked adult accompanying a child on journeys or during supervised contact. The chaperone supports safeguarding, handovers and emotional regulation — not only driving from A to B.',
    },
    {
      q: 'What are chaperoning services?',
      a: 'Chaperoning services is the same provision as chaperone service — supervised child escort and transport. Commissioners use both phrases in care plans, contracts and panel papers. CAMS delivers chaperoning services for children in care, SEND and contact transport.',
    },
    {
      q: 'What is the difference between chaperone services and chaperone service?',
      a: 'Both describe the same CAMS provision. "Chaperone services" is common in contracts; "chaperone service" appears in individual care plans. We optimise for both search terms.',
    },
    {
      q: 'Do you offer chaperone service near me?',
      a: 'CAMS delivers chaperone service and chaperoning services across West London boroughs and Watford/Hertfordshire. Visit our service areas page for chaperone service Ealing, Hounslow, Harrow, Brent and other locations.',
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
