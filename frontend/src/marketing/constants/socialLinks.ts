/** Canonical CAMS services social profiles (footer, contact, JSON-LD sameAs). */
import { GBP_LISTING_URL, YELL_LISTING_URL } from '@/marketing/constants/businessNap';

export const CAMS_SOCIAL_LINKS = [
  {
    platform: 'facebook' as const,
    label: 'CAMS services on Facebook',
    url: 'https://www.facebook.com/profile.php?id=61590231848807',
  },
  {
    platform: 'instagram' as const,
    label: 'CAMS services on Instagram',
    url: 'https://www.instagram.com/camsservicesltd/',
  },
] as const;

export type CamsSocialPlatform = (typeof CAMS_SOCIAL_LINKS)[number]['platform'];

/** Profile URLs for schema.org sameAs and citations. */
export const CAMS_SOCIAL_PROFILE_URLS: readonly string[] = CAMS_SOCIAL_LINKS.map(
  (link) => link.url
);

/** Social + directory listings for JSON-LD sameAs (GBP, Yell, Facebook, Instagram). */
export const CAMS_SAME_AS_PROFILE_URLS: readonly string[] = [
  ...CAMS_SOCIAL_PROFILE_URLS,
  GBP_LISTING_URL,
  YELL_LISTING_URL,
];

/** Site settings API shape (fallback when CMS unavailable). */
export function camsSocialLinksForSiteSettings(): Array<{
  platform: string;
  url: string;
  icon: string;
}> {
  return CAMS_SOCIAL_LINKS.map((link) => ({
    platform: link.platform === 'facebook' ? 'Facebook' : 'Instagram',
    url: link.url,
    icon: link.platform,
  }));
}
