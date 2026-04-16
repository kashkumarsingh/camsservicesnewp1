import type { MetadataRoute } from "next";
import { getCanonicalUrlForSiteSlug } from "@/marketing/lib/public-site-url";
import { INTERVENTION_PACKAGE_IDS } from "@/marketing/mock/intervention-packages";
import { shouldIndexSite } from "@/marketing/lib/site-indexing";

const STATIC_SLUGS = [
  "",
  "about",
  "services",
  "packages",
  "sports-support-programme",
  "contact",
  "referral",
  "blog",
  "careers",
  "risk-assessment",
  "become-a-trainer",
  "trainers",
  "faq",
  "policies",
] as const;

const HIGH_PRIORITY_SLUGS = new Set(["", "about", "services", "packages", "contact", "blog"]);

export default function sitemap(): MetadataRoute.Sitemap {
  if (!shouldIndexSite()) {
    return [];
  }

  const now = new Date();

  const pageEntries: MetadataRoute.Sitemap = STATIC_SLUGS.map((slug) => ({
    url: getCanonicalUrlForSiteSlug(slug),
    lastModified: now,
    changeFrequency: HIGH_PRIORITY_SLUGS.has(slug) ? "weekly" : "monthly",
    priority: slug === "" ? 1 : HIGH_PRIORITY_SLUGS.has(slug) ? 0.9 : 0.7,
  }));

  const packageEntries: MetadataRoute.Sitemap = INTERVENTION_PACKAGE_IDS.map((id) => ({
    url: getCanonicalUrlForSiteSlug(`packages/${id}`),
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.75,
  }));

  return [...pageEntries, ...packageEntries];
}
