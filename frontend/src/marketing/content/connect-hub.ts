/**
 * Shareable CAMS link-in-bio hub (/connect).
 * Copy and destination URLs for WhatsApp, SMS, email and social sharing.
 */

import { CAMS_SOCIAL_LINKS } from '@/marketing/constants/socialLinks';
import {
  BUSINESS_NAP,
  BUSINESS_WEBSITE,
  GBP_LISTING_URL,
  GBP_YELL_AREA_LABELS,
  GBP_YELL_PRIMARY_AREA_SLUGS,
  YELL_LISTING_URL,
} from '@/marketing/constants/businessNap';
import {
  INTERVENTION_PACKAGES,
  PACKAGE_STARTING_PRICES,
  type InterventionPackageId,
} from '@/marketing/mock/intervention-packages';
import { ROUTES } from '@/shared/utils/routes';

export const CONNECT_LAUNCH_DATE_LABEL = '20 September' as const;

/** Canonical URL to put in WhatsApp, SMS and email (production site). */
export const CONNECT_SHARE_PATH = ROUTES.CONNECT;

export const CONNECT_CANONICAL_SHARE_URL = `${BUSINESS_WEBSITE}${ROUTES.CONNECT}` as const;

export const CONNECT_SHARE_MESSAGE = [
  'CAMS Services is preparing to launch its flexible Membership and Support Subscription service on 20 September.',
  '',
  'CAMS stands for Chaperone Activity Mentor Support. We provide structured chaperone, mentoring, activity, community engagement and family support for children and young people aged 8 and above.',
  '',
  'If you are a parent, foster carer, school or children’s home looking for support, register your interest today.',
  '',
  'We are also inviting experienced mentors, chaperones and support workers to register for future opportunities in their local area.',
  '',
  'Connect first. Then support change.',
].join('\n');

export const CONNECT_EMAIL_SUBJECT =
  'CAMS Services – membership and support launching 20 September';

export const CONNECT_MEMBERSHIP_TIER_IDS = [
  'mercury',
  'venus',
  'earth',
  'jupiter',
] as const satisfies readonly InterventionPackageId[];

export type ConnectMembershipTier = {
  readonly id: InterventionPackageId;
  readonly name: string;
  readonly hours: string;
  readonly price: string;
  readonly summary: string;
  readonly href: string;
};

export const CONNECT_MEMBERSHIP_TIERS: readonly ConnectMembershipTier[] =
  CONNECT_MEMBERSHIP_TIER_IDS.map((id) => {
    const pkg = INTERVENTION_PACKAGES.find((item) => item.id === id);
    return {
      id,
      name: pkg?.name ?? id,
      hours: pkg?.frequencyLine ?? '',
      price: PACKAGE_STARTING_PRICES[id],
      summary: pkg?.programmeSubtitle ?? '',
      href: ROUTES.PACKAGE_BY_SLUG(id),
    };
  });

export const CONNECT_MEMBER_ACTIONS = [
  { href: ROUTES.ABOUT, label: 'Learn about CAMS Services' },
  { href: ROUTES.PACKAGES, label: 'View all subscriptions' },
  { href: ROUTES.REGISTER, label: 'Register for CAMS Membership' },
  { href: ROUTES.REGISTER, label: 'Create a family account' },
  { href: ROUTES.LOGIN, label: 'Access the CAMS Member Portal' },
  { href: ROUTES.CONTACT, label: 'Register your interest before 20 September' },
] as const;

export const CONNECT_WORK_ACTIONS = [
  { href: ROUTES.CAREERS, label: 'Learn about the CAMS role' },
  { href: ROUTES.AREAS, label: 'View areas where support may become available' },
  { href: ROUTES.BECOME_A_TRAINER, label: 'Register your interest' },
  { href: ROUTES.BECOME_A_TRAINER, label: 'Create a staff profile' },
  {
    href: ROUTES.BECOME_A_TRAINER,
    label: 'Upload DBS, training, identification and documents',
  },
  {
    href: ROUTES.BECOME_A_TRAINER,
    label: 'Enter assessment, safeguarding and staff matching',
  },
] as const;

export const CONNECT_PRIMARY_BUTTONS = [
  { href: `${ROUTES.CONNECT}#member`, label: 'Become a CAMS Member' },
  { href: `${ROUTES.CONNECT}#work`, label: 'Work With CAMS' },
  { href: ROUTES.REFERRAL, label: 'Refer a Family' },
  { href: ROUTES.CONTACT, label: 'Contact CAMS' },
] as const;

export const CONNECT_OPPORTUNITY_AREAS = GBP_YELL_PRIMARY_AREA_SLUGS.map((slug) => ({
  href: ROUTES.AREA_BY_SLUG(slug),
  label: GBP_YELL_AREA_LABELS[slug],
}));

const FACEBOOK_URL =
  CAMS_SOCIAL_LINKS.find((link) => link.platform === 'facebook')?.url ?? '';
const INSTAGRAM_URL =
  CAMS_SOCIAL_LINKS.find((link) => link.platform === 'instagram')?.url ?? '';

/**
 * LinkedIn company page was requested but no verified profile URL is in the
 * site constants yet. This slug matches the Instagram handle; replace when the
 * live company page is confirmed.
 */
export const CAMS_LINKEDIN_COMPANY_URL =
  'https://www.linkedin.com/company/camsservicesltd/' as const;

export type ConnectDirectoryLink = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
};

export const CONNECT_DIRECTORY_LINKS: readonly ConnectDirectoryLink[] = [
  {
    id: 'website',
    label: 'CAMS Services website',
    href: `${BUSINESS_WEBSITE}/`,
    external: true,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: CAMS_LINKEDIN_COMPANY_URL,
    external: true,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    href: FACEBOOK_URL,
    external: true,
  },
  {
    id: 'instagram',
    label: 'Instagram',
    href: INSTAGRAM_URL,
    external: true,
  },
  {
    id: 'yell',
    label: 'Yell business page',
    href: YELL_LISTING_URL,
    external: true,
  },
  {
    id: 'gbp',
    label: 'Google Business Profile',
    href: GBP_LISTING_URL,
    external: true,
  },
  {
    id: 'email',
    label: BUSINESS_NAP.email,
    href: `mailto:${BUSINESS_NAP.email}`,
    external: false,
  },
  {
    id: 'phone',
    label: BUSINESS_NAP.phone,
    href: `tel:${BUSINESS_NAP.phoneTelHref}`,
    external: false,
  },
  {
    id: 'whatsapp',
    label: 'WhatsApp CAMS',
    href: `https://wa.me/${BUSINESS_NAP.phoneTelHref.replace('+', '')}`,
    external: true,
  },
];

export function buildConnectShareText(pageUrl: string): string {
  return `${CONNECT_SHARE_MESSAGE}\n\n${pageUrl}`;
}

export function buildWhatsAppShareHref(pageUrl: string): string {
  return `https://wa.me/?text=${encodeURIComponent(buildConnectShareText(pageUrl))}`;
}

export function buildSmsShareHref(pageUrl: string): string {
  return `sms:?body=${encodeURIComponent(buildConnectShareText(pageUrl))}`;
}

export function buildEmailShareHref(pageUrl: string): string {
  const body = buildConnectShareText(pageUrl);
  return `mailto:?subject=${encodeURIComponent(CONNECT_EMAIL_SUBJECT)}&body=${encodeURIComponent(body)}`;
}

export function buildLinkedInShareHref(pageUrl: string): string {
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`;
}

export function buildFacebookShareHref(pageUrl: string): string {
  return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`;
}
