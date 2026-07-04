import type { ServiceProgrammeListItem } from '@/marketing/mock/services-programmes';

export type ServiceSeoCopy = {
  overview: string;
  delivery: string;
  commissioning: string;
  featuresIntro: string;
};

/** Server-rendered service detail copy for text-HTML ratio. */
export function getServiceSeoCopy(programme: ServiceProgrammeListItem): ServiceSeoCopy {
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
