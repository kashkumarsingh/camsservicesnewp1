import type { CamsIconName } from '@/marketing/mock/cams-icon-registry';
import { CAMS_UNSPLASH_PHOTO } from '@/marketing/mock/cams-unsplash';

export type CamsUnsplashPhotoId =
  (typeof CAMS_UNSPLASH_PHOTO)[keyof typeof CAMS_UNSPLASH_PHOTO];

export interface MarketingBlogPostDTO {
  slug: string;
  metaTitle: string;
  title: string;
  excerpt: string;
  category: string;
  publishedLabel: string;
  readTimeLabel: string;
  icon: CamsIconName;
  coverPhotoId: CamsUnsplashPhotoId;
  coverImageUrl?: string;
  body: string[];
}

export interface SitePageDTO {
  slug: string;
  title: string;
  heroHeading: string;
  summary: string;
  sourceHtmlFile: string;
}
