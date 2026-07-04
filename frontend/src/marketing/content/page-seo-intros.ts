import { ROUTES } from '@/shared/utils/routes';
import type { PageSeoLink } from '@/marketing/components/seo/PageSeoProse';

export type PageSeoIntroContent = {
  eyebrow?: string;
  title: string;
  titleAs?: 'h1' | 'h2';
  paragraphs: readonly string[];
  links?: readonly PageSeoLink[];
};

export const HOME_SEO_PROSE = {
  eyebrow: 'Chaperone services UK',
  title: 'Professional chaperone service for children and young people',
  paragraphs: [
    'CAMS Services delivers chaperone services UK-wide for local authorities, schools, foster agencies and families. Our chaperone service pairs DBS-checked escorts with safeguarding-first planning for contact centres, school transport, foster placement moves and community access.',
    'A professional chaperone service is not a taxi booking. Each journey includes risk assessment, calm handovers, de-escalation where needed and factual reporting for referrers. Commissioners choose CAMS when court-ordered contact, SEMH needs or placement instability mean a child cannot travel alone.',
    'Alongside chaperone services we provide child transport, youth mentoring, SEND support and family support through graduated intervention packages. Every plan is scoped around the individual child, not a one-size template.',
  ] as const,
  links: [
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'read our chaperone services guide' },
    { href: ROUTES.SERVICES, label: 'view all programmes' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
  ] as const satisfies readonly PageSeoLink[],
};

export const SERVICES_INDEX_SEO_PROSE = {
  eyebrow: 'Chaperone & transport',
  title: 'Chaperone services and specialist child support programmes',
  titleAs: 'h1' as const,
  paragraphs: [
    'CAMS Services is a UK provider of chaperone services, child transport services, school transport support, contact centre transport and SEND support. Local authorities, schools and families commission our chaperone service when supervised travel or accompaniment is required for safeguarding reasons.',
    'Each programme below is delivered one-to-one with DBS-checked practitioners. Chaperone services can be combined with mentoring, family support or residential transition work through our intervention packages.',
    'We do not offer medical chaperoning for clinical examinations. Our chaperone services focus on children in care, foster placements, SEMH presentations and court-ordered family contact.',
  ] as const,
  links: [
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'chaperone services UK guide' },
    { href: ROUTES.CONTACT, label: 'contact the team' },
  ] as const satisfies readonly PageSeoLink[],
};

export const BLOG_INDEX_SEO_PROSE = {
  eyebrow: 'Commissioning guides',
  title: 'Chaperone services, transport and family support articles',
  titleAs: 'h2' as const,
  paragraphs: [
    'Read CAMS Services guides on chaperone services, chaperone service commissioning, child transport, SEND support and mentoring. Written for local authorities, schools and families navigating referrals in the UK.',
    'Start with our chaperone services UK article if you are scoping supervised contact transport, school runs or foster placement escorts.',
  ] as const,
  links: [
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'chaperone services UK' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
  ] as const satisfies readonly PageSeoLink[],
};

export const ABOUT_SEO_PROSE = {
  eyebrow: 'About CAMS Services',
  title: 'UK chaperone services and intervention provider',
  paragraphs: [
    'CAMS Services has supported hundreds of families with chaperone services, child transport, mentoring and SEND support. We work with local authorities, schools, foster agencies and parents who need a reliable chaperone service when children cannot travel or attend contact alone.',
    'Our practitioners are DBS-checked, safeguarding-trained and supervised. We focus on children\'s social care, not medical or entertainment chaperoning.',
  ] as const,
  links: [
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'chaperone services guide' },
    { href: ROUTES.CONTACT, label: 'contact us' },
  ] as const satisfies readonly PageSeoLink[],
};

export const CONTACT_SEO_PROSE = {
  eyebrow: 'Speak to CAMS',
  title: 'Contact us about chaperone services',
  titleAs: 'h1' as const,
  paragraphs: [
    'Contact CAMS Services to discuss chaperone services, chaperone service cover for contact or school transport, intervention packages or a general referral. Our team responds within one working day.',
    'Have schedule and safeguarding details ready so we can confirm chaperone services capacity quickly.',
  ] as const,
  links: [
    { href: ROUTES.REFERRAL, label: 'submit a referral online' },
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'read about chaperone services' },
  ] as const satisfies readonly PageSeoLink[],
};

export const REFERRAL_SEO_PROSE = {
  eyebrow: 'Commission chaperone services',
  title: 'Refer a chaperone service or transport package',
  titleAs: 'h1' as const,
  paragraphs: [
    'Use this form to refer chaperone services, child transport or wider CAMS support. Local authorities, schools, foster agencies and parents can request a chaperone service for contact transport, school runs, foster moves or community access.',
    'Include placement details, court dates where relevant, behaviour notes and handover instructions so we can confirm chaperone services capacity quickly. Urgent contact cover is often feasible within 48 to 72 hours when safeguarding information is complete.',
  ] as const,
  links: [
    { href: `${ROUTES.BLOG}/chaperone-services-uk`, label: 'chaperone services guide' },
    { href: ROUTES.CONTACT, label: 'contact us' },
  ] as const satisfies readonly PageSeoLink[],
};

export const BECOME_A_TRAINER_SEO_PROSE = {
  eyebrow: 'Join our team',
  title: 'Become a CAMS practitioner',
  titleAs: 'h1' as const,
  paragraphs: [
    'CAMS Services recruits DBS-checked mentors and chaperone practitioners to deliver one-to-one support across the UK. If you have experience in youth work, SEND, fostering or safeguarding, apply to join our team.',
  ] as const,
  links: [{ href: ROUTES.TRAINERS, label: 'meet our trainers' }] as const satisfies readonly PageSeoLink[],
};

export const CAREERS_SEO_PROSE = {
  eyebrow: 'Careers',
  title: 'Careers at CAMS Services',
  titleAs: 'h1' as const,
  paragraphs: [
    'CAMS Services offers careers delivering chaperone services, mentoring and family support for children and young people. We look for reliable practitioners who understand safeguarding and trauma-informed practice.',
  ] as const,
  links: [{ href: ROUTES.BECOME_A_TRAINER, label: 'become a trainer' }] as const satisfies readonly PageSeoLink[],
};

export const RISK_ASSESSMENT_SEO_PROSE = {
  eyebrow: 'Suitability check',
  title: 'Is CAMS chaperone or mentoring support right?',
  titleAs: 'h1' as const,
  paragraphs: [
    'This short risk assessment helps families and referrers consider whether CAMS chaperone services, transport or mentoring packages match the young person\'s needs and current context. It does not replace a local authority safeguarding review.',
  ] as const,
  links: [
    { href: ROUTES.CONTACT, label: 'speak to our team' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
  ] as const satisfies readonly PageSeoLink[],
};
