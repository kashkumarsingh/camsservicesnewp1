import type { ServiceProgrammeListItem } from '@/marketing/mock/services-programmes';

export type ServiceSeoCopy = {
  overview: string;
  delivery: string;
  commissioning: string;
  featuresIntro: string;
};

const COMMUNITY_CHAPERONE_COPY: ServiceSeoCopy = {
  overview:
    'Chaperone & Community Transport Services is CAMS services\' core chaperone service for children and young people. We provide chaperone services on contact centre runs, school transport, foster placement journeys and community outings. Each assignment uses DBS-checked escorts who understand safeguarding, handover protocols and de-escalation.',
  delivery:
    'Our chaperone service is person-centred: the same practitioner can anchor multiple journeys in a week when continuity helps the child. Sessions are risk-assessed, documented for referrers where commissioned, and aligned with court orders or care plans. This is children\'s social care chaperoning, not medical or entertainment chaperoning.',
  commissioning:
    'Commission chaperone services through a referral or consultation. CAMS services confirms capacity, agrees hours and can combine chaperone service hours with mentoring or family support through intervention packages.',
  featuresIntro: 'Our chaperone services programme typically includes:',
};

/** Server-rendered service detail copy for text-HTML ratio. */
export function getServiceSeoCopy(programme: ServiceProgrammeListItem): ServiceSeoCopy {
  if (programme.anchorId === 'programme-community') {
    return COMMUNITY_CHAPERONE_COPY;
  }

  const title = programme.title;
  const tagline = programme.tagline;

  return {
    overview: `${title} from CAMS services provides ${tagline.toLowerCase()}. ${programme.description} Provision is one-to-one, safeguarding-led, and tailored to each young person rather than delivered as a generic group programme.`,
    delivery:
      'Sessions are planned with referrers and families, risk-assessed for location and timing, and delivered by DBS-checked CAMS services practitioners. We document factual progress where commissioned and escalate safeguarding concerns through agreed routes.',
    commissioning:
      'Commissioning begins with a referral or consultation. CAMS services confirms capacity, agrees hours, and aligns the plan with EHCP, PEP, or social-care requirements where relevant. Packages can combine this programme with transport, mentoring, or family support for joined-up weeks.',
    featuresIntro: `The ${title} programme typically includes:`,
  };
}
