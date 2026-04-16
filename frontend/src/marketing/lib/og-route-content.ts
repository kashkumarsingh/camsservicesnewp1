import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";

const DEFAULT_SUMMARY =
  "Structured mentoring and intervention for young people across the UK.";

const PAGE_FALLBACKS: Record<string, { title: string; summary: string }> = {
  "": {
    title: "CAMS Services",
    summary: "Trauma-informed mentoring and intervention support for children and young people.",
  },
  about: {
    title: "About CAMS Services",
    summary: "Learn about our team, mission, and child-centred support model.",
  },
  services: {
    title: "Services",
    summary: "Explore programmes designed to build confidence, regulation, and progress.",
  },
  packages: {
    title: "Packages",
    summary: "Compare intervention tiers and find the right support level.",
  },
  contact: {
    title: "Contact CAMS",
    summary: "Speak to our team about referrals, packages, and support options.",
  },
  blog: {
    title: "Blog & Insights",
    summary: "Practical guidance for parents, carers, schools, and professionals.",
  },
};

export async function getOgContentForSlug(slug: string): Promise<{ title: string; summary: string }> {
  if (slug.startsWith("packages/")) {
    const id = slug.split("/")[1];
    const pkg = INTERVENTION_PACKAGES.find((item) => item.id === id);
    if (pkg) {
      return {
        title: `${pkg.name}, ${pkg.programmeSubtitle} | CAMS`,
        summary: `${pkg.frequencyLine}. ${pkg.bestFor}`,
      };
    }
  }

  const fallback = PAGE_FALLBACKS[slug];
  if (fallback) {
    return fallback;
  }

  return {
    title: "CAMS Services",
    summary: DEFAULT_SUMMARY,
  };
}
