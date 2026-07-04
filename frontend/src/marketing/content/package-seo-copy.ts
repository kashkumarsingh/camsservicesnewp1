import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";
import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";

export type PackageSeoCopy = {
  readonly overview: string;
  readonly whoFor: string;
  readonly included: string;
  readonly outcomes: string;
  readonly commissioning: string;
  readonly longForm: string;
  readonly features: readonly string[];
};

const SHARED_INCLUDED =
  "All CAMS intervention packages include DBS-checked mentors, transport where sessions require travel, refreshments during activities, and written progress updates for parents and referrers.";

const SHARED_COMMISSIONING =
  "Commissioning starts with a referral or consultation. We confirm safeguarding information, agree locations and session times, and align the plan with any EHCP, PEP, or social-care requirements. Mid-programme reviews keep professionals informed, and end-of-block reports summarise outcomes and next steps.";

/** Server-rendered prose for package detail pages (Semrush: word count, text-HTML ratio). */
export function getPackageSeoCopy(
  packageId: InterventionPackageId,
  packageName: string,
  programmeSubtitle: string,
  frequencyLine: string,
  bestFor: string
): PackageSeoCopy {
  const tier = packageName;
  const hours = frequencyLine.replace(/\s*hours?/i, "").trim();

  const overview = `The ${tier} package is a ${programmeSubtitle.toLowerCase()} tier in the CAMS services graduated intervention programme. It provides ${hours} hours of structured one-to-one mentoring and activity-based engagement for children and young people who need reliable, trauma-informed support in the community, at home, or in education settings. Families, schools, and local authority teams choose ${tier} when they want a clear plan, measurable goals, and consistent contact with the same DBS-checked mentor across a six-week block.`;

  const whoFor = `${bestFor} The ${tier} pathway suits referrers who have identified needs around confidence, behaviour, routine, SEMH, or family stability. Sessions can include sports, creative activities, community access, and coaching conversations that build trust before tackling harder goals.`;

  const included = `${SHARED_INCLUDED} On the ${tier} tier, mentors deliver planned sessions matched to the agreed hours, with activity costs and travel included unless otherwise stated in your quotation.`;

  const outcomes = `Families and referrers typically use the ${tier} package to improve attendance, emotional regulation, and engagement with school or placement plans. Progress is tracked against goals the young person co-owns, with written summaries suitable for PEP reviews, social-work updates, and parent meetings.`;

  const commissioning = `${SHARED_COMMISSIONING} If you are unsure whether ${tier} is the right tier, compare all levels on our packages page or book a consultation. ${SHARED_INCLUDED}`;

  const longForm = `When you commission the ${tier} package, CAMS services assigns a named mentor where possible, agrees session venues with your referrer, and sets goals the young person co-owns. Reviews during the six-week block keep parents, carers, and professionals aligned. If needs change, we can recommend stepping up to a higher tier or adding transport and family support so provision stays coherent. CAMS services documents attendance, engagement, and safeguarding notes where required so panels and reviewing officers see that support is active, not only listed on paper.`;

  const pkgMeta = INTERVENTION_PACKAGES.find((p) => p.id === packageId);
  const features = pkgMeta?.features ?? [];

  const byId: Partial<Record<InterventionPackageId, Partial<PackageSeoCopy>>> = {
    mercury: {
      overview:
        "The Mercury package is CAMS services' entry assessment and planning tier. Before a longer intervention begins, Mercury establishes strengths, risks, and recommended support pathways through a focused assessment and structured first contact with the young person.",
      outcomes:
        "Mercury gives referrers a clear recommendation for the next tier, whether that is early engagement on Venus or a longer block on Earth or Mars. The written summary supports panel decisions, PEP targets, and family conversations about realistic next steps.",
    },
    venus: {
      overview:
        "The Venus package is CAMS services' early engagement tier. It builds trust through short, structured mentoring sessions and activity-based contact so referrers can test readiness for a longer programme.",
      outcomes:
        "Venus is ideal when a young person needs quick wins and confidence before committing to higher hours. Referrers receive early progress notes and a recommendation on whether to step up to Earth or maintain light-touch support.",
    },
    earth: {
      overview:
        "The Earth package is CAMS services' core engagement tier and one of our most popular choices for sustained mentoring. It balances enough hours to build routine with manageable commissioning cost for schools and local authorities.",
      outcomes:
        "Earth packages often target improved school attendance, calmer mornings, and better family communication. End-of-block reports summarise goal completion and whether Jupiter or Mars is the logical next step.",
    },
    mars: {
      overview:
        "The Mars package adds mentoring depth for young people who need more than core engagement but are not yet ready for the highest tiers. It suits SEMH presentations where behaviour has stabilised enough for skills-building work.",
      outcomes:
        "Mars referrals frequently focus on reducing exclusions, rebuilding peer relationships, and preparing for reintegration after part-time timetables or AP placements.",
    },
    jupiter: {
      overview:
        "The Jupiter package provides extended mentoring hours for young people with multiple risk factors across home, school, and community settings. It is often commissioned when Earth-level support has helped but not fully resolved attendance or regulation goals.",
      outcomes:
        "Jupiter programmes emphasise sustained relationship work, structured goal review, and coordination with social workers, SENCOs, and carers where agreed.",
    },
    saturn: {
      overview:
        "The Saturn package supports complex cases that need consistent adult presence across the week. Referrers choose Saturn when placement stability, exploitation risk, or chronic school refusal requires structured, repeatable contact.",
      outcomes:
        "Saturn outcomes are tracked against safeguarding indicators as well as attendance and confidence. Written updates help IROs and reviewing officers evidence that intensive support is active.",
    },
    uranus: {
      overview:
        "The Uranus package is designed for high-need young people who require detailed planning, frequent sessions, and enhanced reporting. It bridges the gap between standard intensive tiers and the Neptune flagship programme.",
      outcomes:
        "Uranus commissioning often follows placement breakdown, serious safeguarding concerns, or multi-agency plans that require a single trusted mentor to anchor the week.",
    },
    neptune: {
      overview:
        "The Neptune package is CAMS services' most intensive flagship tier. It combines the highest mentoring hours in our solar-system model with enhanced reporting and multi-agency coordination where commissioned.",
      outcomes:
        "Neptune is used when previous programmes need extending or when a young person requires wraparound consistency across home, school, and contact arrangements. Referrers receive detailed progress evidence suitable for complex proceedings and placement reviews.",
      commissioning:
        "Neptune commissioning includes enhanced planning meetings, agreed escalation routes, and structured multi-agency updates where required. We scope Neptune carefully so hours match risk rather than defaulting to maximum intensity without review.",
    },
  };

  const overrides = byId[packageId] ?? {};

  return {
    overview: overrides.overview ?? overview,
    whoFor: overrides.whoFor ?? whoFor,
    included: overrides.included ?? included,
    outcomes: overrides.outcomes ?? outcomes,
    commissioning: overrides.commissioning ?? commissioning,
    longForm: overrides.longForm ?? longForm,
    features: overrides.features ?? features,
  };
}
