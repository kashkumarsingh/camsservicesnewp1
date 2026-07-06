import type { CamsIconName } from '@/marketing/components/shared/CamsIcon';

export const SCHOOLS_WELCOME_PARAGRAPHS = [
  'Thank you for choosing to work in partnership with CAMS Services Ltd. We value collaborative relationships with schools and educational settings and are committed to providing high-quality, safeguarding-led support that promotes positive outcomes for children, young people, and their families.',
  'This page summarises our organisation, services, referral process, safeguarding arrangements, and how we work alongside schools before support begins. Download the full School Onboarding Pack for your records.',
] as const;

export const SCHOOLS_PURPOSE_POINTS = [
  'Introduce CAMS Services Ltd and the services we provide.',
  'Explain our referral and onboarding process.',
  'Outline our safeguarding and compliance arrangements.',
  'Clarify communication and reporting expectations.',
  'Support effective partnership working.',
  'Provide schools with key operational information before support begins.',
] as const;

export const SCHOOLS_CORE_VALUES = [
  'Safeguarding First',
  'Person-Centred Practice',
  'Positive Relationships',
  'Equality, Diversity and Inclusion',
  'Professionalism and Integrity',
  'Continuous Improvement',
  'Positive Outcomes',
] as const;

export const SCHOOLS_SERVICE_AREAS: ReadonlyArray<{
  title: string;
  items: readonly string[];
}> = [
  {
    title: 'Mentoring and Coaching',
    items: [
      'Confidence building',
      'Emotional wellbeing',
      'Goal setting',
      'Personal development',
      'Resilience',
      'Motivation',
      'Positive decision-making',
    ],
  },
  {
    title: 'SEND and Education Support',
    items: [
      'Autism Spectrum Condition (ASC)',
      'ADHD',
      'SEMH needs',
      'School avoidance',
      'Behavioural challenges',
      'Low educational engagement',
      'Additional learning needs',
      'Transition support',
    ],
  },
  {
    title: 'Behaviour and Emotional Support',
    items: [
      'Emotional regulation',
      'Positive behaviour support',
      'Conflict resolution',
      'Communication skills',
      'Relationship building',
      'Behaviour support planning',
    ],
  },
  {
    title: 'Community and Family Support',
    items: [
      'Build independence and life skills',
      'Increase confidence and social interaction',
      'Access community opportunities',
      'Improve family communication',
      'Support coordinated interventions',
      'Encourage partnership working',
    ],
  },
] as const;

export const SCHOOLS_REFERRAL_STEPS: ReadonlyArray<{
  number: string;
  icon: CamsIconName;
  title: string;
  text: string;
}> = [
  {
    number: '1',
    icon: 'clipboardList',
    title: 'Referral received',
    text: 'School or referrer submits details about the young person and support needs.',
  },
  {
    number: '2',
    icon: 'heartHandshake',
    title: 'Safeguarding screening',
    text: 'We review safeguarding information and complete risk assessment where required.',
  },
  {
    number: '3',
    icon: 'phoneCall',
    title: 'Planning meeting',
    text: 'We agree goals, contacts, reporting arrangements and session locations.',
  },
  {
    number: '4',
    icon: 'lineChart',
    title: 'Delivery and review',
    text: 'Intervention begins with progress reviews, outcome monitoring and agreed closure.',
  },
] as const;

export const SCHOOLS_INFORMATION_REQUIRED: ReadonlyArray<{
  title: string;
  items: readonly string[];
}> = [
  {
    title: 'Pupil information',
    items: ['Name', 'Date of birth', 'Year group', 'Parent or carer details', 'Emergency contacts'],
  },
  {
    title: 'Educational information',
    items: [
      'Attendance information',
      'Behaviour information',
      'Current support plans',
      'EHCP where applicable',
      'SEND information and relevant reports',
    ],
  },
  {
    title: 'Safeguarding information',
    items: [
      'DSL contact details',
      'Known safeguarding concerns',
      'Medical information',
      'Behaviour risks',
      'Other relevant professional information',
    ],
  },
] as const;

export const SCHOOLS_SAFEGUARDING_ARRANGEMENTS = [
  'Designated Safeguarding Lead (DSL)',
  'Enhanced DBS checks',
  'Safer recruitment procedures',
  'Risk assessments',
  'Incident reporting procedures',
  'Confidentiality and information sharing procedures',
  'GDPR compliance',
  'Health and safety arrangements',
  'Staff supervision and ongoing training',
] as const;

export const SCHOOLS_REPORTING_UPDATES = [
  'Attendance updates',
  'Session summaries',
  'Progress reviews',
  'Outcome reports',
  'Incident reports where applicable',
  'Safeguarding notifications where appropriate',
] as const;

export const SCHOOLS_QUALITY_COMMITMENTS = [
  'Regular supervision',
  'Staff training',
  'Case reviews',
  'Safeguarding audits',
  'Quality assurance monitoring',
  'Outcome measurement',
  'Feedback from schools, families, and individuals',
  'Continuous service improvement',
] as const;

export const SCHOOLS_CAMS_RESPONSIBILITIES = [
  'Deliver professional and person-centred support.',
  'Maintain safeguarding-led practice.',
  'Communicate effectively.',
  'Protect confidentiality.',
  'Provide agreed reports and updates.',
  'Work collaboratively with partner organisations.',
] as const;

export const SCHOOLS_PARTNER_RESPONSIBILITIES = [
  'Provide accurate referral information.',
  'Share relevant safeguarding information.',
  'Identify key contacts.',
  'Participate in review meetings where appropriate.',
  'Inform CAMS Services of significant changes affecting the individual.',
] as const;

export const SCHOOLS_RELATED_POLICIES: ReadonlyArray<{
  slug: string;
  title: string;
  description: string;
}> = [
  {
    slug: 'transport-chaperone-policy',
    title: 'Transport and Chaperone Policy',
    description:
      'How we plan journeys, manage risk, and maintain safeguarding during transport and chaperone work.',
  },
  {
    slug: 'pick-up-drop-off-procedure',
    title: 'Pick Up and Drop Off Procedure',
    description:
      'Collection, school handover, and drop-off standards for safe transfer of responsibility.',
  },
] as const;
  'Referral received',
  'Initial information reviewed',
  'Safeguarding information shared',
  'Risk assessment completed where required',
  'Parent or carer consent confirmed',
  'School contact identified',
  'DSL contact confirmed',
  'Reporting arrangements agreed',
  'Information sharing arrangements agreed',
  'Initial planning meeting completed',
] as const;
