import type { MetadataRoute } from "next";
import { ListFAQItemsUseCase } from "@/core/application/faq/useCases/ListFAQItemsUseCase";
import { ListTrainersUseCase } from "@/core/application/trainers/useCases/ListTrainersUseCase";
import { faqRepository } from "@/infrastructure/persistence/faq";
import { trainerRepository } from "@/infrastructure/persistence/trainers";
import { policiesData } from "@/data/policiesData";
import { getCanonicalUrlForSiteSlug } from "@/marketing/lib/public-site-url";
import { INTERVENTION_PACKAGE_IDS } from "@/marketing/mock/intervention-packages";
import {
  SERVICE_PROGRAMME_LIST,
  serviceSlugFromProgramme,
} from "@/marketing/mock/services-programmes";
import { getBlogPosts } from "@/marketing/server/blog/getBlogPosts";
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
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly"
): MetadataRoute.Sitemap[number] {
  return {
    url: getCanonicalUrlForSiteSlug(slug),
    lastModified: new Date(),
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

  let blogEntries: MetadataRoute.Sitemap = [];
  try {
    const posts = await getBlogPosts({ published: true });
    blogEntries = posts.map((post) => entry(`blog/${post.slug}`, 0.7, "weekly"));
  } catch {
    blogEntries = [];
  }

  let trainerEntries: MetadataRoute.Sitemap = [];
  try {
    const trainersUseCase = new ListTrainersUseCase(trainerRepository);
    const trainers = await trainersUseCase.execute();
    trainerEntries = trainers.map((trainer) => entry(`trainers/${trainer.slug}`, 0.6));
  } catch {
    trainerEntries = [];
  }

  let faqEntries: MetadataRoute.Sitemap = [];
  try {
    const faqUseCase = new ListFAQItemsUseCase(faqRepository);
    const faqItems = await faqUseCase.execute();
    faqEntries = faqItems.map((item) => entry(`faq/${item.slug}`, 0.6));
  } catch {
    faqEntries = [];
  }

  return [
    ...pageEntries,
    ...packageEntries,
    ...serviceEntries,
    ...policyEntries,
    ...blogEntries,
    ...trainerEntries,
    ...faqEntries,
  ];
}
