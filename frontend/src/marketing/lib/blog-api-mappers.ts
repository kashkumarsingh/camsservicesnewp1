import type { MarketingBlogPostDTO } from "@/marketing/types/blog";
import { CAMS_UNSPLASH_PHOTO } from "@/marketing/mock/cams-unsplash";
import { normalizeBlogHeroImage } from "@/marketing/lib/blog-image";

export type BlogApiPost = {
  slug?: string;
  title?: string;
  excerpt?: string;
  content?: string;
  heroImage?: string;
  category?: { name?: string };
  publishedAt?: string;
  readingTime?: number;
  seo?: { title?: string };
};

export function mapBlogApiPostToDto(
  row: BlogApiPost,
  fallbackSlug: string
): MarketingBlogPostDTO {
  const content = typeof row.content === "string" ? row.content : "";
  const body = content
    .split(/\n{2,}/)
    .map((chunk) => chunk.trim())
    .filter((chunk) => chunk.length > 0);

  return {
    slug: `blog/${String(row.slug ?? fallbackSlug).replace(/^\/+/, "")}`,
    metaTitle:
      typeof row.seo?.title === "string" && row.seo.title.length > 0
        ? row.seo.title
        : `${String(row.title ?? "Blog Post")} | CAMS Services`,
    title: String(row.title ?? "Blog Post"),
    excerpt: String(row.excerpt ?? ""),
    category: String(row.category?.name ?? "Insights"),
    publishedLabel:
      typeof row.publishedAt === "string"
        ? new Date(row.publishedAt).toLocaleDateString("en-GB", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "Recently published",
    readTimeLabel: `${Number(row.readingTime ?? 5)} min read`,
    icon: "bookOpen",
    coverPhotoId: CAMS_UNSPLASH_PHOTO.community,
    coverImageUrl: normalizeBlogHeroImage(row.heroImage) ?? undefined,
    body: body.length > 0 ? body : [content || "Content coming soon."]
  };
}
