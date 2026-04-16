/**
 * Public pages content constants (single source of truth for frontend).
 */

export const PUBLIC_PAGES_CONTENT_SLUGS = [
  'about',
  'services',
  'packages',
  'blog',
  'contact',
  'faq',
  'trainers',
  'policies',
] as const;

export type PublicPageContentSlug = (typeof PUBLIC_PAGES_CONTENT_SLUGS)[number];

export const HERO_BACKGROUND_TYPE = {
  VIDEO: 'video',
  IMAGE: 'image',
} as const;

export const HERO_BUTTON_COUNT = {
  NONE: 0,
  ONE: 1,
  TWO: 2,
} as const;

export const HERO_BUTTON_SIZE = {
  SMALL: 'sm',
  MEDIUM: 'md',
  LARGE: 'lg',
} as const;

export const HERO_BACKGROUND_TYPE_LABELS: Record<string, string> = {
  video: 'Video',
  image: 'Image',
};

export const HERO_BUTTON_COUNT_LABELS: Record<number, string> = {
  0: 'No buttons',
  1: 'One button (primary)',
  2: 'Two buttons',
};

export const HERO_BUTTON_SIZE_LABELS: Record<string, string> = {
  sm: 'Small',
  md: 'Medium',
  lg: 'Large',
};

export const PUBLIC_PAGES_CONTENT_EDIT_UNAVAILABLE =
  'Content editing is not yet available for this page.';

export const POLICY_DOCUMENT_SLUGS = [
  'cancellation-policy',
  'cookie-policy',
  'payment-refund-policy',
  'privacy-policy',
  'safeguarding-policy',
  'terms-of-service',
] as const;

export type PolicyDocumentSlug = (typeof POLICY_DOCUMENT_SLUGS)[number];

export const POLICY_DOCUMENT_LABELS: Record<PolicyDocumentSlug, string> = {
  'cancellation-policy': 'Cancellation Policy',
  'cookie-policy': 'Cookie Policy',
  'payment-refund-policy': 'Payment and Refund Policy',
  'privacy-policy': 'Privacy Policy',
  'safeguarding-policy': 'Safeguarding Policy',
  'terms-of-service': 'Terms of Service',
};

export const PUBLIC_PAGES_CONTENT_LABELS: Record<PublicPageContentSlug, string> = {
  about: 'About Us',
  services: 'Services',
  packages: 'Packages',
  blog: 'Blog',
  contact: 'Contact',
  faq: 'FAQ',
  trainers: 'Trainers',
  policies: 'Policies',
};
