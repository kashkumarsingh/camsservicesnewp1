import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";

const DEFAULT_SUMMARY =
  "Trusted chaperone, transport, mentoring and support services tailored to individual needs.";

const PAGE_FALLBACKS: Record<string, { title: string; summary: string }> = {
  "": {
    title: "CAMS Services",
    summary: "Tailored support services for children, young people, families, and vulnerable adults.",
  },
  about: {
    title: "About CAMS Services",
    summary: "Learn about our team, mission, and person-centred support model.",
  },
  services: {
    title: "Our Services",
    summary: "Chaperone, transport, mentoring, SEND support, and tailored one-to-one packages.",
  },
  referral: {
    title: "Referral Partners",
    summary: "We welcome referrals from local authorities, schools, nurseries, and families.",
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
