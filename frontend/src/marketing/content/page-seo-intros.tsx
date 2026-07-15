import { ROUTES } from '@/shared/utils/routes';
import type { PageSeoLink } from '@/marketing/components/seo/PageSeoProse';

export type PageSeoIntroContent = {
  eyebrow?: string;
  title: string;
  titleAs?: 'h1' | 'h2';
  paragraphs: readonly string[];
  links?: readonly PageSeoLink[];
};

const CAMS =
  'CAMS services is a UK provider of chaperone transport, youth mentoring, SEND support, and family coaching for children and young people.';

export const HOME_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Chaperone services UK',
  title: 'Professional chaperone services and chaperone service for children',
  paragraphs: [
    `${CAMS} Our chaperone services support local authorities, schools, foster agencies, and families who need safeguarding-first escorts for contact transport, school runs, foster moves and community access.`,
    'Commissioners search for chaperone services when a child cannot travel alone. Our chaperone service pairs DBS-checked practitioners with planned journeys, handover protocols and de-escalation support. This is not a standard taxi booking.',
    'We deliver chaperone services across West London and the wider UK, including SEND-aware school transport, supervised contact centre journeys and mentoring combined through intervention packages.',
    'Explore our dedicated chaperone services page, service areas for borough-level cover, or submit a referral to confirm capacity and safeguarding requirements.',
  ],
  links: [
    { href: ROUTES.CHAPERONE_SERVICES, label: 'chaperone services' },
    { href: ROUTES.AREAS, label: 'chaperone services near you' },
    { href: ROUTES.AREA_SERVICE_BY_SLUG('ealing', 'community'), label: 'chaperone service Ealing' },
    { href: ROUTES.AREA_SERVICE_BY_SLUG('harrow', 'mentoring'), label: 'youth mentoring Harrow' },
    { href: ROUTES.SERVICE_BY_SLUG('community'), label: 'community transport programme' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
    { href: ROUTES.CONTACT, label: 'contact CAMS services' },
  ],
};

export const ABOUT_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Our story',
  title: 'About CAMS services',
  paragraphs: [
    `${CAMS} For more than ten years we have supported over five hundred families with trauma-informed mentoring, chaperone transport, and structured intervention packages.`,
    'Our model is trust-first: young people need predictable adults, clear boundaries, and strengths-based feedback before harder goals feel achievable. We align with schools, social workers, and carers so messaging stays consistent across home and education.',
    'CAMS services recruits practitioners against rigorous safeguarding standards, provides ongoing supervision, and documents outcomes for referrers who need audit-ready evidence. We believe every child deserves safe transport, respectful mentoring, and support that meets SEND and SEMH needs without stigma.',
  ],
  links: [
    { href: ROUTES.SERVICES, label: 'our services' },
    { href: ROUTES.PACKAGES, label: 'intervention packages' },
    { href: ROUTES.POLICIES, label: 'policies and safeguarding' },
  ],
};

export const SERVICES_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Programmes',
  title: 'CAMS services programmes for families and referrers',
  titleAs: 'h2',
  paragraphs: [
    `${CAMS} Each programme below is delivered one-to-one with DBS-checked practitioners, individual risk assessments, and referrer reporting where commissioned.`,
    'Choose sports and fitness pathways for regulation through movement, community access and transport for safe journeys, mentoring for confidence and decision-making, family support for communication at home, or SEND support for school engagement.',
    'Programmes can be combined with intervention packages so transport, mentoring, and family coaching align across the week. Contact CAMS services to scope hours, locations, and safeguarding requirements for your referral.',
  ],
  links: [
    { href: ROUTES.PACKAGES, label: 'intervention packages' },
    { href: ROUTES.REFERRAL, label: 'referral form' },
    { href: ROUTES.FAQ, label: 'frequently asked questions' },
  ],
};

export const BLOG_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Commissioning guides',
  title: 'CAMS services commissioning guides',
  titleAs: 'h2',
  paragraphs: [
    'Read practical guides from CAMS services on chaperone services UK, child transport, youth mentoring, SEND support, foster placement stability, and school transport for SEMH needs.',
    'Articles are written for local authority commissioners, SENCOs, foster agencies, and parents who need clear language about safeguarding, referrals, and how intervention packages work in practice.',
    'Use these guides alongside our services and packages pages when planning provision, panel submissions, or family conversations about next steps.',
  ],
  links: [
    { href: ROUTES.SERVICES, label: 'CAMS services' },
    { href: ROUTES.PACKAGES, label: 'packages' },
    { href: ROUTES.CONTACT, label: 'contact the team' },
  ],
};

export const PACKAGES_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Professional and parent referrals',
  title: 'CAMS intervention packages',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services offers eight graduated intervention packages, from a short Mercury assessment block through to our Neptune flagship programme. Each tier combines structured one-to-one mentoring, activity-based engagement, and clear reporting so families, schools, and local authorities can match hours and intensity to the young person’s needs.',
    'Packages include DBS-checked mentors, transport for session travel where required, refreshments during activities, and written updates for parents and referrers. Following an initial consultation we recommend the most appropriate tier and provide a personalised quotation aligned with your safeguarding and placement requirements.',
  ],
  links: [
    { href: ROUTES.SERVICES, label: 'chaperone and mentoring services' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
    { href: ROUTES.FAQ, label: 'frequently asked questions' },
  ],
};

export const POLICIES_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Legal and safeguarding',
  title: 'CAMS policies and legal documents',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services Ltd maintains clear, accessible policies so families, schools, and commissioning teams understand how we handle data, safeguarding, cancellations, cookies, payments, transport, and pick-up arrangements. Our documents follow UK requirements including GDPR, safeguarding statutory guidance, and consumer rights for service bookings.',
    'Each policy below explains what you can expect when you refer a child, book an intervention package, or work with our mentors and chaperones. We review documents regularly and publish updates on this page.',
  ],
  links: [
    { href: ROUTES.FAQ, label: 'frequently asked questions' },
    { href: ROUTES.PACKAGES, label: 'intervention packages' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
  ],
};

export const FAQ_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Commissioning support',
  title: 'Answers for families, schools and referrers',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services supports children and young people with chaperone transport, one-to-one mentoring, SEND support, and family coaching. Families, schools, and local authorities use this page to understand referrals, safeguarding, payments, and how intervention packages are commissioned before sessions begin.',
    'Browse the questions below for practical detail on referrals, DBS checks, session reporting, and how packages are scoped. If your question is not covered, contact our team and we will respond within one working day.',
  ],
  links: [
    { href: ROUTES.SERVICES, label: 'CAMS services' },
    { href: ROUTES.PACKAGES, label: 'intervention packages' },
    { href: ROUTES.POLICIES, label: 'policies and safeguarding' },
  ],
};

export const TRAINERS_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Our practitioners',
  title: 'Meet the CAMS services team',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services trainers are DBS-checked specialists delivering trauma-informed mentoring, chaperone support, and SEND-aware sessions across the UK. Every practitioner is recruited against our safeguarding standards, trained in de-escalation and professional boundaries, and supervised by experienced leads who understand education, children’s services, and family support contexts.',
    'Families and referrers work with the same mentor wherever possible so young people build trust and consistency. Trainers lead activities that match each child’s interests, from sports and fitness to community outings, while tracking goals agreed at the start of an intervention package.',
    'Session notes and referrer updates are completed where commissioned so families, schools, and local authorities can see that provision is active and aligned with agreed goals.',
  ],
  links: [
    { href: ROUTES.BECOME_A_TRAINER, label: 'become a trainer' },
    { href: ROUTES.PACKAGES, label: 'intervention packages' },
    { href: ROUTES.BLOG, label: 'commissioning guides' },
  ],
};

export const AREAS_INDEX_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Coverage map',
  title: 'CAMS services areas across London, Essex and Hertfordshire',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services Ltd delivers chaperone services, child transport, youth mentoring, SEND support and family support across twenty-five borough and county hubs from our Greenford headquarters in Ealing.',
    'West London coverage includes Ealing, Hounslow, Hillingdon, Brent, Harrow, Hammersmith and Fulham, Richmond upon Thames and Kensington and Chelsea. North London includes Barnet and Enfield. Hertfordshire includes Watford, Hertsmere, St Albans, Hemel Hempstead and Stevenage. Essex includes Chelmsford, Brentwood, Basildon, Harlow and Colchester. Berkshire includes Slough on the Heathrow corridor.',
    'Outer London boroughs such as Kingston upon Thames, Waltham Forest, Haringey and Redbridge extend our North East and South West routes. Each area page links to six programme-specific pages for chaperone service, mentoring, SEND support, family support, behaviour support and sports programmes.',
    'Commissioners and families can make a referral with postcodes and timescales. We confirm feasibility within one working day and align safeguarding, handover protocols and court schedules before the first journey.',
  ],
  links: [
    { href: ROUTES.AREA_BY_SLUG('ealing'), label: 'Ealing (HQ Greenford)' },
    { href: ROUTES.AREA_BY_SLUG('chelmsford'), label: 'Chelmsford Essex' },
    { href: ROUTES.CHAPERONE_SERVICES, label: 'chaperone services UK' },
    { href: ROUTES.REFERRAL, label: 'make a referral' },
  ],
};

export const CONTACT_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Get in touch',
  title: 'Contact CAMS services for chaperone and transport support',
  titleAs: 'h2',
  paragraphs: [
    'Speak to CAMS services about chaperone services, child transport, contact centre journeys, mentoring, SEND support, or family coaching for a child or young person in your care.',
    'Our team responds to enquiries from parents, schools, local authorities, and IFAs within one working day from our Greenford office (51 Eastmead Avenue, UB6 9RD), with delivery across London, Essex and the UK.',
    'If you already have court dates, panel deadlines, or placement moves scheduled, include timescales in your message so we can prioritise feasibility checks.',
  ],
  links: [
    { href: ROUTES.REFERRAL, label: 'make a referral online' },
    { href: ROUTES.PACKAGES, label: 'view packages' },
    { href: ROUTES.FAQ, label: 'read FAQs' },
  ],
};

export const REFERRAL_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Referrals',
  title: 'Refer a child or young person to CAMS services',
  titleAs: 'h2',
  paragraphs: [
    'Local authorities, schools, nurseries, foster agencies, and parents can refer to CAMS services for chaperone transport, mentoring, SEMH support, and SEND interventions.',
    'Strong referrals include the young person’s story, current risks, preferred package tier, schedule constraints, and any court orders or handover instructions for transport work.',
    'After submission, a CAMS team member will confirm safeguarding details, recommend hours, and agree session locations before provision begins.',
  ],
  links: [
    { href: ROUTES.SCHOOLS, label: 'school partnerships and onboarding pack' },
    { href: ROUTES.PACKAGES, label: 'compare packages' },
    { href: ROUTES.POLICIES, label: 'safeguarding policies' },
    { href: ROUTES.CONTACT, label: 'contact us' },
  ],
};

export const SCHOOLS_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'School partnerships',
  title: 'Onboarding for schools and educational settings',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services partners with schools, SENCOs, and pastoral teams to deliver safeguarding-led mentoring, transport, SEND support, and structured intervention packages for pupils who need consistent adult support.',
    'This page summarises our referral process, information requirements, safeguarding arrangements, and reporting expectations before support begins. Download the School Onboarding Pack for your records or share it with your DSL and commissioning lead.',
    'Schools across London, Essex, and the wider UK commission CAMS for SEMH-friendly school runs, attendance support, and one-to-one mentoring aligned with EHCP and pastoral plans.',
  ],
  links: [
    { href: ROUTES.REFERRAL, label: 'make a referral' },
    { href: ROUTES.POLICIES_BY_SLUG('transport-chaperone-policy'), label: 'transport and chaperone policy' },
    { href: ROUTES.POLICIES_BY_SLUG('safeguarding-policy'), label: 'safeguarding policy' },
    { href: ROUTES.CONTACT, label: 'contact the team' },
  ],
};

export const CAREERS_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Careers',
  title: 'Careers at CAMS services',
  titleAs: 'h2',
  paragraphs: [
    'Join CAMS services as a mentor, chaperone, or specialist practitioner and help young people build confidence, attendance, and safer routines.',
    'We offer curated bookings matched to your safeguarding profile, activity specialisms, and geography. Practitioners receive induction, supervision, and ongoing safeguarding training aligned with UK children’s services standards.',
    'If you are passionate about trauma-informed work, reliable attendance, and professional boundaries, explore current opportunities and the trainer application pathway.',
  ],
  links: [
    { href: ROUTES.BECOME_A_TRAINER, label: 'become a trainer' },
    { href: ROUTES.CONTACT, label: 'contact recruitment' },
  ],
};

export const BECOME_A_TRAINER_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Join our team',
  title: 'Become a CAMS services trainer',
  titleAs: 'h2',
  paragraphs: [
    'CAMS services trainers deliver one-to-one mentoring, chaperone journeys, sports sessions, and community access support for children and young people across the UK.',
    'Applicants must meet enhanced DBS requirements, demonstrate experience with SEMH, SEND, or children-in-care contexts, and commit to professional boundaries, supervision, and accurate session reporting.',
    'Successful trainers receive matched referrals based on skills and location, with support from safeguarding leads and operations staff who understand education and social care commissioning.',
  ],
  links: [
    { href: ROUTES.CAREERS, label: 'careers page' },
    { href: ROUTES.CONTACT, label: 'contact us' },
  ],
};

export const RISK_ASSESSMENT_SEO_PROSE: PageSeoIntroContent = {
  eyebrow: 'Suitability',
  title: 'CAMS services risk and suitability guidance',
  titleAs: 'h2',
  paragraphs: [
    'Use this page to understand whether CAMS services support is appropriate for your young person, placement, or commissioning context.',
    'We assess safeguarding information, behaviour history, medical needs, and logistics before confirming chaperone cover, mentoring hours, or package tiers. Honest disclosure helps us plan safe sessions and realistic goals.',
    'If risk is high or needs fall outside our scope, we will signpost alternatives or recommend combined provision with other agencies rather than accepting work we cannot deliver safely.',
  ],
  links: [
    { href: ROUTES.REFERRAL, label: 'submit a referral' },
    { href: ROUTES.CONTACT, label: 'speak to the team' },
    { href: ROUTES.POLICIES, label: 'read safeguarding policies' },
  ],
};
