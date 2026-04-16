/**
 * Single source of truth for intervention tiers (home teaser + /packages).
 * Packages follow solar-system order (Mercury → Neptune). Planet names are thematic;
 * tiers scale graduation hours and support depth.
 * Home and /packages show the first {@link PACKAGES_PAGE_INITIAL_FEATURE_COUNT} bullets until “Show more”.
 */

/** Collapsed package card bullets (home + /packages) before expanding */
export const PACKAGES_PAGE_INITIAL_FEATURE_COUNT = 4 as const;

/** Classical planets in order from the Sun; single source for column order and ids. */
export const INTERVENTION_PACKAGE_IDS = [
  "mercury",
  "venus",
  "earth",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune"
] as const;

export type InterventionPackageId = (typeof INTERVENTION_PACKAGE_IDS)[number];

export type PackageComparisonCell = {
  readonly text: string;
  readonly emphasized?: boolean;
};

export type PackageComparisonRow = {
  readonly feature: string;
  readonly cells: Readonly<Record<InterventionPackageId, PackageComparisonCell>>;
};

export type InterventionPackage = {
  readonly id: InterventionPackageId;
  readonly name: string;
  /** Label on home pricing teaser cards */
  readonly homeBadge: string;
  readonly featured: boolean;
  /** Floating badge on packages page (e.g. Most Popular, Best for Complex Needs) */
  readonly packagesPageBadge: string | null;
  /** Badge look on /packages; gradient = primary highlight, outline = secondary highlight */
  readonly packagesPageBadgeStyle: "gradient" | "outline" | null;
  readonly price: string;
  readonly programmeSubtitle: string;
  /** Total hours; shown prominently on /packages */
  readonly frequencyLine: string;
  /** Single line under price on home (hours only) */
  readonly homeDurationLine: string;
  readonly features: readonly string[];
  /** Short “best for” line after feature bullets on /packages */
  readonly bestFor: string;
  readonly packagesPageCtaLabel: string;
  readonly packagesPageCtaHref: "/sign-in";
  readonly homeCtaLabel: string;
  readonly homeCtaHref: "/packages";
  readonly homeCtaVariant: "primary" | "secondary";
};

export const INTERVENTION_PACKAGES: readonly InterventionPackage[] = [
  {
    id: "mercury",
    name: "Mercury",
    homeBadge: "Assessment",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£195",
    programmeSubtitle: "Initial Assessment",
    frequencyLine: "3 Hours",
    homeDurationLine: "3 Hours",
    features: [
      "Structured initial assessment session",
      "Engagement and behaviour overview",
      "Trust-building first contact",
      "Clear support pathway and recommendations",
      "Feedback to parent/referrer",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for understanding needs before starting structured support.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "venus",
    name: "Venus",
    homeBadge: "Early engagement",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£300",
    programmeSubtitle: "Early Engagement",
    frequencyLine: "6 Hours",
    homeDurationLine: "6 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Goal setting (2-3 clear targets)",
      "Early progress tracking",
      "Written summary with next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for building early engagement and quick wins.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "earth",
    name: "Earth",
    homeBadge: "Most Popular",
    featured: true,
    packagesPageBadge: "Most Popular",
    packagesPageBadgeStyle: "gradient",
    price: "£450",
    programmeSubtitle: "Core Intervention",
    frequencyLine: "9 Hours",
    homeDurationLine: "9 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised support plan based on initial assessment",
      "Progress tracking against agreed goals",
      "Behaviour, engagement, and attitude monitoring",
      "Mid-point check-in with parent/referrer",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for consistent support and measurable progress.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "Select Package",
    homeCtaHref: "/packages",
    homeCtaVariant: "primary"
  },
  {
    id: "mars",
    name: "Mars",
    homeBadge: "Behaviour focus",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£600",
    programmeSubtitle: "Behaviour & Routine Focus",
    frequencyLine: "12 Hours",
    homeDurationLine: "12 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised intervention plan based on assessment",
      "Behaviour, engagement, and routine monitoring",
      "Progress tracking against agreed goals",
      "Mid-programme review with parent/referrer",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for building structure, routine, and behaviour change.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "jupiter",
    name: "Jupiter",
    homeBadge: "High impact",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£750",
    programmeSubtitle: "High Impact Mentoring",
    frequencyLine: "15 Hours",
    homeDurationLine: "15 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised intervention plan based on assessment",
      "Behaviour, engagement, and resilience development",
      "Structured progress tracking and review points",
      "Coordination with school or professionals (if agreed)",
      "Mid-programme report",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for higher-risk cases needing stronger structure and coordination.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "saturn",
    name: "Saturn",
    homeBadge: "Complex needs",
    featured: false,
    packagesPageBadge: "Best for Complex Needs",
    packagesPageBadgeStyle: "outline",
    price: "£900",
    programmeSubtitle: "Deep Intervention",
    frequencyLine: "18 Hours",
    homeDurationLine: "18 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised intervention plan based on assessment",
      "Behaviour, engagement, and routine monitoring",
      "Structured progress tracking and feedback",
      "Parent/referrer strategy session",
      "Mid-programme progress update",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for ongoing behavioural needs and deeper intervention.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "uranus",
    name: "Uranus",
    homeBadge: "Premium",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£1,050",
    programmeSubtitle: "Premium Intensive Support",
    frequencyLine: "21 Hours",
    homeDurationLine: "21 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised multi-area support plan based on assessment",
      "Behaviour, engagement, and social development monitoring",
      "Bi-weekly detailed progress tracking",
      "Senior mentor oversight",
      "Priority scheduling",
      "Parent/referrer strategy session",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for complex cases needing consistency and priority support.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  },
  {
    id: "neptune",
    name: "Neptune",
    homeBadge: "Flagship",
    featured: false,
    packagesPageBadge: null,
    packagesPageBadgeStyle: null,
    price: "£1,200",
    programmeSubtitle: "Flagship Programme",
    frequencyLine: "24 Hours",
    homeDurationLine: "24 Hours",
    features: [
      "Structured 1:1 mentoring sessions",
      "Activity-based engagement to build trust and confidence",
      "Personalised long-term intervention plan based on assessment",
      "Continuous progress tracking and documentation",
      "Behaviour, engagement, and independence development",
      "Regular updates to parent/referrer",
      "Senior oversight and coordinated planning",
      "Follow-up session included",
      "End-of-programme written report with outcomes and next steps",
      "Transport costs included for all sessions",
      "Refreshments and snacks included for all sessions",
      "DBS checked mentor"
    ],
    bestFor: "Best for full support and long-term progression.",
    packagesPageCtaLabel: "Select Package",
    packagesPageCtaHref: "/sign-in",
    homeCtaLabel: "View packages",
    homeCtaHref: "/packages",
    homeCtaVariant: "secondary"
  }
];

export function getInterventionPackageById(
  id: InterventionPackageId
): InterventionPackage | undefined {
  return INTERVENTION_PACKAGES.find((p) => p.id === id);
}

export const PACKAGE_COMPARISON_ROWS: readonly PackageComparisonRow[] = [
  {
    feature: "Hours",
    cells: {
      mercury: { text: "3" },
      venus: { text: "6" },
      earth: { text: "9", emphasized: true },
      mars: { text: "12" },
      jupiter: { text: "15" },
      saturn: { text: "18" },
      uranus: { text: "21" },
      neptune: { text: "24" }
    }
  },
  {
    feature: "Price",
    cells: {
      mercury: { text: "£195" },
      venus: { text: "£300" },
      earth: { text: "£450", emphasized: true },
      mars: { text: "£600" },
      jupiter: { text: "£750" },
      saturn: { text: "£900" },
      uranus: { text: "£1,050" },
      neptune: { text: "£1,200" }
    }
  },
  {
    feature: "Cost per Hour",
    cells: {
      mercury: { text: "£65" },
      venus: { text: "£50" },
      earth: { text: "£50", emphasized: true },
      mars: { text: "£50" },
      jupiter: { text: "£50" },
      saturn: { text: "£50" },
      uranus: { text: "£50" },
      neptune: { text: "£50" }
    }
  },
  {
    feature: "1:1 Mentoring",
    cells: {
      mercury: { text: "✓" },
      venus: { text: "✓" },
      earth: { text: "✓" },
      mars: { text: "✓" },
      jupiter: { text: "✓" },
      saturn: { text: "✓" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Activities Included",
    cells: {
      mercury: { text: "1" },
      venus: { text: "1-2" },
      earth: { text: "2-3" },
      mars: { text: "2-4" },
      jupiter: { text: "3-4" },
      saturn: { text: "3-5" },
      uranus: { text: "4-5" },
      neptune: { text: "5+" }
    }
  },
  {
    feature: "Support Plan",
    cells: {
      mercury: { text: "Basic" },
      venus: { text: "✓" },
      earth: { text: "✓", emphasized: true },
      mars: { text: "✓" },
      jupiter: { text: "✓" },
      saturn: { text: "✓" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Progress Tracking",
    cells: {
      mercury: { text: "Basic" },
      venus: { text: "✓" },
      earth: { text: "Structured", emphasized: true },
      mars: { text: "Structured" },
      jupiter: { text: "Structured" },
      saturn: { text: "Structured" },
      uranus: { text: "Detailed" },
      neptune: { text: "Continuous" }
    }
  },
  {
    feature: "Behaviour Focus",
    cells: {
      mercury: { text: "-" },
      venus: { text: "Light" },
      earth: { text: "✓", emphasized: true },
      mars: { text: "✓ Strong" },
      jupiter: { text: "✓ Strong" },
      saturn: { text: "✓ Strong" },
      uranus: { text: "✓ Advanced" },
      neptune: { text: "✓ Advanced" }
    }
  },
  {
    feature: "Parent / Referrer Check-in",
    cells: {
      mercury: { text: "Feedback" },
      venus: { text: "Summary" },
      earth: { text: "Mid-point", emphasized: true },
      mars: { text: "Review" },
      jupiter: { text: "Review" },
      saturn: { text: "Strategy session" },
      uranus: { text: "Strategy session" },
      neptune: { text: "Ongoing" }
    }
  },
  {
    feature: "Reports",
    cells: {
      mercury: { text: "Brief" },
      venus: { text: "Summary" },
      earth: { text: "Full", emphasized: true },
      mars: { text: "Full" },
      jupiter: { text: "Mid + Final" },
      saturn: { text: "Final" },
      uranus: { text: "Detailed" },
      neptune: { text: "Full documentation" }
    }
  },
  {
    feature: "School / Professional Liaison",
    cells: {
      mercury: { text: "-" },
      venus: { text: "-" },
      earth: { text: "-" },
      mars: { text: "-" },
      jupiter: { text: "✓" },
      saturn: { text: "✓" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Senior Oversight",
    cells: {
      mercury: { text: "-" },
      venus: { text: "-" },
      earth: { text: "-" },
      mars: { text: "-" },
      jupiter: { text: "-" },
      saturn: { text: "-" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Priority Scheduling",
    cells: {
      mercury: { text: "-" },
      venus: { text: "-" },
      earth: { text: "-" },
      mars: { text: "-" },
      jupiter: { text: "-" },
      saturn: { text: "-" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Follow-up Session",
    cells: {
      mercury: { text: "-" },
      venus: { text: "-" },
      earth: { text: "-" },
      mars: { text: "-" },
      jupiter: { text: "-" },
      saturn: { text: "-" },
      uranus: { text: "-" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Transport Included",
    cells: {
      mercury: { text: "✓" },
      venus: { text: "✓" },
      earth: { text: "✓" },
      mars: { text: "✓" },
      jupiter: { text: "✓" },
      saturn: { text: "✓" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  },
  {
    feature: "Snacks Included",
    cells: {
      mercury: { text: "✓" },
      venus: { text: "✓" },
      earth: { text: "✓" },
      mars: { text: "✓" },
      jupiter: { text: "✓" },
      saturn: { text: "✓" },
      uranus: { text: "✓" },
      neptune: { text: "✓" }
    }
  }
];

export type PackageFaqItem = { readonly q: string; readonly a: string };

export const PACKAGE_FAQ_ITEMS: readonly PackageFaqItem[] = [
  {
    q: "Which package should I choose?",
    a: "Tiers are named in solar-system order from Mercury (initial assessment) through Neptune (our flagship programme). Earth is our most popular core intervention (9 hours). Saturn suits deeper, ongoing behavioural needs. Choose based on hours, support intensity, and reporting depth; we can advise on a call."
  },
  {
    q: "Can I extend a package?",
    a: "Yes. Packages can be extended with additional hours. We recommend reviewing progress at the end of each package and agreeing next steps together."
  },
  {
    q: "What if my circumstances change?",
    a: "We're flexible. If a young person's needs change mid-programme, we can adjust the intervention plan. Contact us to discuss options."
  },
  {
    q: "Do you offer additional support costs?",
    a: "Package fees include transport to sessions. Specialist activities beyond the agreed plan, or extra formal reports, may have additional costs. Anything extra is agreed in advance with full transparency."
  },
  {
    q: "How do payment terms work?",
    a: "Single sessions are paid in full. Block bookings (packages) are due within 14 days of invoice. We offer flexible payment arrangements for specific circumstances."
  },
  {
    q: "What happens after a package ends?",
    a: "We provide detailed recommendations and follow-up support. Many young people continue with extended or different packages based on progress and evolving needs."
  },
  {
    q: "Can packages be customized?",
    a: "Absolutely. If our standard packages don't perfectly fit your needs, we can discuss custom interventions. Contact us to explore options."
  },
  {
    q: "What's included in the cost?",
    a: "Cost includes the mentor's time, DBS checking, training, supervision, transport to sessions, reports where applicable, and ongoing communication with referrers."
  }
];
