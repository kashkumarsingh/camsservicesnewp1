import type { MetadataRoute } from "next";
import { policiesData } from "@/data/policiesData";
import { getCanonicalUrlForSiteSlug } from "@/marketing/lib/public-site-url";
import { getSeoBlogSitemapEntries } from "@/marketing/content/blog";
import { INTERVENTION_PACKAGE_IDS } from "@/marketing/mock/intervention-packages";
import {
  SERVICE_PROGRAMME_LIST,
  serviceSlugFromProgramme,
} from "@/marketing/mock/services-programmes";
import { shouldIndexSite } from "@/marketing/lib/site-indexing";

const STATIC_SLUGS = [
  "",
  "about",
  "services",
  "packages",
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

function entry(
  slug: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  lastModified: Date = new Date()
): MetadataRoute.Sitemap[number] {
  return {
    url: getCanonicalUrlForSiteSlug(slug),
    lastModified,
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!shouldIndexSite()) {
    return [];
  }

  const pageEntries: MetadataRoute.Sitemap = STATIC_SLUGS.map((slug) =>
    entry(
      slug,
      slug === "" ? 1 : HIGH_PRIORITY_SLUGS.has(slug) ? 0.9 : 0.7,
      HIGH_PRIORITY_SLUGS.has(slug) ? "weekly" : "monthly"
    )
  );

  const packageEntries = INTERVENTION_PACKAGE_IDS.map((id) =>
    entry(`packages/${id}`, 0.75)
  );

  const serviceEntries = SERVICE_PROGRAMME_LIST.map((programme) =>
    entry(`services/${serviceSlugFromProgramme(programme)}`, 0.8, "weekly")
  );

  const policyEntries = policiesData.map((policy) => entry(`policies/${policy.slug}`, 0.5));

  const blogEntries: MetadataRoute.Sitemap = getSeoBlogSitemapEntries().map((post) =>
    entry(post.path, 0.7, "weekly", post.lastModified)
  );

  return [
    ...pageEntries,
    ...packageEntries,
    ...serviceEntries,
    ...policyEntries,
    ...blogEntries,
  ];
}
