import type { CamsIconName } from "@/marketing/mock/cams-icon-registry";
import { camsProgrammeImagePath, type CamsProgrammeImageKey } from "@/marketing/mock/cams-public-images";
import { ROUTES } from "@/shared/utils/routes";

export type ServiceProgrammeCoverKey = CamsProgrammeImageKey;

export type ServiceProgrammeListItem = {
  readonly anchorId: string;
  readonly numberLabel: string;
  readonly title: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly href: string;
  readonly coverKey: ServiceProgrammeCoverKey;
  readonly listIcon: CamsIconName;
  /** Short line for cards and related-programme strips. */
  readonly tagline: string;
};

/** Order matches services jump nav / home pathways — one-to-one delivery, same detail routes. */
export const SERVICE_PROGRAMME_LIST: readonly ServiceProgrammeListItem[] = [
  {
    anchorId: "programme-sports-support-programme",
    numberLabel: "01 — Sports pathway",
    title: "Sports Support Programme",
    description:
      "One-to-one support across training, development and participation in sport, with mentoring woven through sessions so confidence and consistency build together.",
    features: [
      "Training and competition readiness",
      "Development planning with the young person",
      "Participation and engagement in sport settings",
      "Mentoring alongside physical progression"
    ],
    href: ROUTES.SERVICE_BY_SLUG("sports-support-programme"),
    coverKey: "outdoorEngagement",
    listIcon: "trophy",
    tagline: "One-to-one support across training, development and participation in sport"
  },
  {
    anchorId: "programme-boxing-fitness",
    numberLabel: "02 — Fitness pathway",
    title: "Fitness and Wellbeing",
    description:
      "One-to-one support to improve physical health, routine and overall wellbeing through activity-led mentoring and achievable weekly habits.",
    features: [
      "Physical health and energy",
      "Routine and healthy habits",
      "Emotional regulation through movement",
      "Wellbeing goals co-designed with the young person"
    ],
    href: ROUTES.SERVICE_BY_SLUG("boxing-fitness"),
    coverKey: "boxingFitness",
    listIcon: "dumbbell",
    tagline: "One-to-one support to improve physical health, routine and overall wellbeing"
  },
  {
    anchorId: "programme-community",
    numberLabel: "03 — Community pathway",
    title: "Community Access and Transport Services",
    description:
      "One-to-one support to safely access the community, activities and appointments, reducing isolation and building real-world confidence step by step.",
    features: [
      "Safe community access and travel",
      "Activities and appointments supported in person",
      "Social confidence in public settings",
      "Practical planning with families and referrers"
    ],
    href: ROUTES.SERVICE_BY_SLUG("community"),
    coverKey: "community",
    listIcon: "trees",
    tagline: "One-to-one support to safely access the community, activities and appointments"
  },
  {
    anchorId: "programme-goals",
    numberLabel: "04 — Behaviour & goals",
    title: "Behavioural Management and Conflict Resolution",
    description:
      "One-to-one strategies to manage behaviour, reduce conflict and improve responses, with goals and reviews everyone can understand.",
    features: [
      "Behaviour strategies that fit the young person",
      "Conflict reduction and de-escalation skills",
      "Clear expectations and consistent follow-through",
      "Milestone reviews with referrers and family"
    ],
    href: ROUTES.SERVICE_BY_SLUG("goals"),
    coverKey: "goals",
    listIcon: "target",
    tagline: "One-to-one strategies to manage behaviour, reduce conflict and improve responses"
  },
  {
    anchorId: "programme-mentoring",
    numberLabel: "05 — Core pathway",
    title: "Mentoring and Coaching",
    description:
      "One-to-one guidance to build confidence, decision making and personal growth, with clear boundaries and safeguarding so trust can deepen safely.",
    features: [
      "Confidence and self-belief",
      "Decision-making and reflection",
      "Personal growth at the young person’s pace",
      "Consistent, DBS-checked mentor relationship"
    ],
    href: ROUTES.SERVICE_BY_SLUG("mentoring"),
    coverKey: "mentoring",
    listIcon: "messageCircle",
    tagline: "One-to-one guidance to build confidence, decision making and personal growth"
  },
  {
    anchorId: "programme-routine",
    numberLabel: "06 — Family & life skills",
    title: "Family Support Service",
    description:
      "One-to-one support to strengthen communication and build healthier relationships between the young person, family and other key adults.",
    features: [
      "Family communication and alignment",
      "Healthier relationships and boundaries",
      "Joint-up messaging with school where needed",
      "Practical strategies that everyone can use"
    ],
    href: ROUTES.SERVICE_BY_SLUG("routine"),
    coverKey: "routine",
    listIcon: "heartHandshake",
    tagline: "One-to-one support to strengthen communication and build healthier relationships"
  },
  {
    anchorId: "programme-sen",
    numberLabel: "07 — Specialist pathway",
    title: "SEN and Education Support",
    description:
      "One-to-one tailored support for additional needs, learning and school engagement, paced for neurodivergent young people and their contexts.",
    features: [
      "Additional learning needs and school engagement",
      "Autism and ADHD-informed approaches",
      "Communication and advocacy support",
      "Flexible pacing with clear structure"
    ],
    href: ROUTES.SERVICE_BY_SLUG("sen"),
    coverKey: "sen",
    listIcon: "puzzle",
    tagline: "One-to-one tailored support for additional needs, learning and school engagement"
  }
];

/** Public programme cover URL (`/images/{slug}.jpg`). */
export function serviceProgrammeImage(item: ServiceProgrammeListItem): string {
  return camsProgrammeImagePath(item.coverKey);
}

export function getRelatedServiceProgrammes(
  excludeHref: string,
  limit: number
): ReadonlyArray<ServiceProgrammeListItem> {
  return SERVICE_PROGRAMME_LIST.filter((p) => p.href !== excludeHref).slice(0, limit);
}

/** Slug segment for `/services/[slug]` (no leading/trailing slashes). */
export function serviceSlugFromProgramme(programme: ServiceProgrammeListItem): string {
  return programme.href.replace(/^\/services\//, "").replace(/\/+$/, "");
}

/** Resolve static programme copy for a public service slug; used when CMS has no published row. */
export function getServiceProgrammeBySlug(slug: string): ServiceProgrammeListItem | undefined {
  const normalized = slug.replace(/^\/+/, "").replace(/^services\//, "").replace(/\/+$/, "");
  return SERVICE_PROGRAMME_LIST.find((p) => serviceSlugFromProgramme(p) === normalized);
}
