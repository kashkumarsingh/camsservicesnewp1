import type { MarketingBlogPostDTO, SitePageDTO } from "@/marketing/types/blog";
import {
  SEO_BLOG_ARTICLES,
  getSeoBlogPostBySlug,
} from "@/marketing/content/blog";

export const BLOG_POST_DTOS: ReadonlyArray<MarketingBlogPostDTO> = SEO_BLOG_ARTICLES;

export function getBlogPostBySlug(slug: string): MarketingBlogPostDTO | null {
  return getSeoBlogPostBySlug(slug);
}

export function blogPostsAsSitePageDtos(): ReadonlyArray<SitePageDTO> {
  return BLOG_POST_DTOS.map((post) => ({
    slug: post.slug,
    title: post.metaTitle,
    heroHeading: post.title,
    summary: post.excerpt,
    sourceHtmlFile: "blog.html",
  }));
}
