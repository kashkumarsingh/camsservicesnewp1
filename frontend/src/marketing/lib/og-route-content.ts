import { INTERVENTION_PACKAGES } from "@/marketing/mock/intervention-packages";

const DEFAULT_SUMMARY =
  "Chaperone services UK, child transport services, family support services, and mentoring services tailored to individual needs.";

const PAGE_FALLBACKS: Record<string, { title: string; summary: string }> = {
  "": {
    title: "Chaperone Services UK | CAMS Services",
    summary:
      "Chaperone services UK, child transport services, family support services, SEND support services, and mentoring services.",
  },
  about: {
    title: "About CAMS Services",
    summary: "Learn about our team, mission, and person-centred support model.",
  },
  services: {
    title: "Chaperone Services UK | Child Transport & SEND Support",
    summary:
      "Child transport services, school transport support, family support services, community support services, and residential care support.",
  },
  referral: {
    title: "Referral Partners | Local Authority Support Services",
    summary:
      "Referrals welcome from local authorities, schools, nurseries, foster agencies, and family support teams.",
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
