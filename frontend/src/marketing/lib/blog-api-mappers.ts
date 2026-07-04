import type { MarketingBlogPostDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";
import { normalizeBlogHeroImage } from "@/marketing/lib/blog-image";
import { formatReadTimeLabel } from "@/marketing/content/blog/seo-blog-helpers";

export type BlogApiPost = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  heroImage?: string;
  category?: { name?: string };
  publishedAt?: string;
  readingTime?: number;
  seo?: { title?: string; description?: string };
  tags?: string[];
};

export function mapBlogApiPostToDto(
  row: BlogApiPost,
  fallbackSlug: string
): MarketingBlogPostDTO {
  const content = typeof row.content === "string" ? row.content : "";
  const focusKeyword =
    typeof row.tags?.[0] === "string" && row.tags[0].length > 0
      ? row.tags[0]
      : String(row.title ?? "CAMS Services");

  return {
    slug: `blog/${String(row.slug ?? fallbackSlug).replace(/^\/+/, "")}`,
    focusKeyword,
    metaTitle:
      typeof row.seo?.title === "string" && row.seo.title.length > 0
        ? row.seo.title
        : `${String(row.title ?? "Blog Post")} | CAMS Services`,
    metaDescription:
      typeof row.seo?.description === "string" && row.seo.description.length > 0
        ? row.seo.description
        : String(row.excerpt ?? ""),
    title: String(row.title ?? "Blog Post"),
    excerpt: String(row.excerpt ?? ""),
    category: String(row.category?.name ?? "Insights"),
    publishedLabel:
      typeof row.publishedAt === "string"
        ? new Date(row.publishedAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "Recently published",
    publishedAt:
      typeof row.publishedAt === "string"
        ? row.publishedAt
        : new Date().toISOString(),
    readTimeLabel: formatReadTimeLabel(content),
    icon: "bookOpen",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.community,
    coverImageUrl: normalizeBlogHeroImage(row.heroImage) ?? undefined,
    coverImageAlt: `Cover image for ${String(row.title ?? "blog article")}`,
    content: content || "Content coming soon.",
    tags: Array.isArray(row.tags) ? row.tags.map(String) : [],
    faq: [],
  };
}
