/**
 * Payload types per block type for Page Builder.
 * API sends camelCase; payload shape is defined by dashboard/CMS per block.
 */

export interface HeroBlockPayload {
  title?: string;
  subtitle?: string;
  videoSrc?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
}

export interface RichTextBlockPayload {
  content?: string;
}

export interface CtaBlockPayload {
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaHref?: string;
  secondaryCtaText?: string;
  secondaryCtaHref?: string;
  variant?: 'default' | 'gradient' | 'solid';
}

export interface FaqBlockPayload {
  title?: string;
  description?: string;
  items?: Array<{ question: string; answer: string; category?: string }>;
}

export interface FeaturesBlockItem {
  icon?: string;
  title: string;
  description?: string;
}

export interface FeaturesBlockPayload {
  title?: string;
  subtitle?: string;
  items?: FeaturesBlockItem[];
}

export interface StatsBlockItem {
  value: string;
  label: string;
  icon?: string;
}

export interface StatsBlockPayload {
  title?: string;
  subtitle?: string;
  items?: StatsBlockItem[];
}

export interface TeamBlockItem {
  name: string;
  role?: string;
  bio?: string;
  imageUrl?: string;
}

export interface TeamBlockPayload {
  title?: string;
  subtitle?: string;
  items?: TeamBlockItem[];
}

export interface TestimonialsBlockItem {
  quote: string;
  authorName: string;
  authorRole?: string;
  imageUrl?: string;
}

export interface TestimonialsBlockPayload {
  title?: string;
  subtitle?: string;
  items?: TestimonialsBlockItem[];
}
