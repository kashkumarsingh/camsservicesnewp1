import type { InterventionPackageId } from "@/marketing/mock/intervention-packages";

export type PackageSeoCopy = {
  readonly overview: string;
  readonly whoFor: string;
  readonly commissioning: string;
};

const SHARED_CLOSING =
  "Every CAMS intervention package includes DBS-checked mentors, transport where sessions require travel, refreshments during activities, and written progress updates for parents and referrers. If you are unsure which tier fits, book a consultation and we will recommend the right level of support.";

/** Server-rendered prose for package detail pages (Semrush: word count, text-HTML ratio, H1 context). */
export function getPackageSeoCopy(
  packageId: InterventionPackageId,
  packageName: string,
  programmeSubtitle: string,
  frequencyLine: string,
  bestFor: string
): PackageSeoCopy {
  const tier = packageName;
  const hours = frequencyLine.replace(/\s*hours?/i, "").trim();

  const overview = `The ${tier} package is a ${programmeSubtitle.toLowerCase()} tier within the CAMS Services graduated intervention programme. It provides ${hours} hours of structured one-to-one mentoring and activity-based engagement, designed for children and young people who need reliable, trauma-informed support in the community, at home, or in education settings. Families, schools, and local authority teams choose ${tier} when they want a clear plan, measurable goals, and consistent contact with the same DBS-checked mentor.`;

  const whoFor = `${bestFor} The ${tier} pathway suits referrers who have already identified needs around confidence, behaviour, routine, SEMH, or family stability, and who want a defined block of support rather than open-ended ad hoc sessions. Sessions can include sports, creative activities, community access, and coaching conversations that build trust before tackling harder goals.`;

  const commissioning = `Commissioning the ${tier} package starts with a referral or consultation. We confirm safeguarding information, agree locations and session times, and align the intervention plan with any existing EHCP, PEP, or social-care requirements. Mid-programme reviews keep parents and professionals informed, and end-of-block reports summarise outcomes and recommended next steps. ${SHARED_CLOSING}`;

  const byId: Partial<Record<InterventionPackageId, Partial<PackageSeoCopy>>> = {
    mercury: {
      overview:
        "The Mercury package is CAMS Services' entry assessment and planning tier. Before a longer intervention begins, Mercury establishes a clear picture of strengths, risks, and recommended support pathways through a focused initial assessment and structured first contact with the young person.",
    },
    neptune: {
      commissioning:
        "Neptune is our most intensive flagship tier for complex needs, combining sustained mentoring hours with enhanced reporting and multi-agency coordination where agreed. Referrers typically use Neptune when previous shorter programmes need extending or when a young person requires wraparound consistency across home, school, and contact arrangements.",
    },
  };

  const overrides = byId[packageId] ?? {};

  return {
    overview: overrides.overview ?? overview,
    whoFor: overrides.whoFor ?? whoFor,
    commissioning: overrides.commissioning ?? commissioning,
  };
}
