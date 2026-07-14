import type { MetadataRoute } from "next";
import { policiesData } from "@/data/policiesData";
import { getCanonicalUrlForSiteSlug } from "@/marketing/lib/public-site-url";
import { getSeoBlogSitemapEntries } from "@/marketing/content/blog";
import { getLocationAreaSitemapEntries } from "@/marketing/content/locations";
import { getPractitionerSitemapEntries } from "@/marketing/content/practitioners";
import { getServiceLocationSitemapEntries } from "@/marketing/content/locations/service-location-page-content";
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
  "chaperone-services",
  "areas",
  "packages",
  "contact",
  "referral",
  "schools",
  "blog",
  "careers",
  "risk-assessment",
  "become-a-trainer",
  "trainers",
  "faq",
  "policies",
] as const;

const HIGH_PRIORITY_SLUGS = new Set(["", "about", "services", "chaperone-services", "areas", "packages", "contact", "blog", "schools"]);

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

  const areaEntries: MetadataRoute.Sitemap = getLocationAreaSitemapEntries().map((area) =>
    entry(area.path, 0.75, "monthly", area.lastModified)
  );

  const serviceLocationEntries: MetadataRoute.Sitemap = getServiceLocationSitemapEntries().map(
    (item) => entry(item.path, 0.7, "monthly", item.lastModified)
  );

  const practitionerEntries: MetadataRoute.Sitemap = getPractitionerSitemapEntries().map((item) =>
    entry(item.path, 0.75, "monthly", item.lastModified)
  );

  return [
    ...pageEntries,
    ...packageEntries,
    ...serviceEntries,
    ...areaEntries,
    ...serviceLocationEntries,
    ...practitionerEntries,
    ...policyEntries,
    ...blogEntries,
  ];
}
