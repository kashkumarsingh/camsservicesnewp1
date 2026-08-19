/**
 * CAMS Membership + Support Subscription specification (website, checkout, portal).
 * Membership status and Support Subscription status are separate account functions.
 */

import { ROUTES } from '@/shared/utils/routes';
import type { InterventionPackageId } from '@/marketing/mock/intervention-packages';

export const CAMS_ACRONYM = 'Chaperone Activity Mentor Support' as const;
export const CAMS_TAGLINE = 'Connect first. Then support change.' as const;
export const CAMS_MEMBERSHIP_MIN_AGE = 8 as const;

export const MEMBERSHIP_TIER_IDS = [
  'mercury',
  'venus',
  'earth',
  'jupiter',
] as const satisfies readonly InterventionPackageId[];

export type MembershipTierId = (typeof MEMBERSHIP_TIER_IDS)[number];

export type MembershipPlan = {
  readonly id: MembershipTierId;
  readonly name: string;
  readonly monthlyPriceGbp: number;
  readonly monthlyPriceLabel: string;
  readonly hours: number;
  readonly hoursLabel: string;
  readonly shortDescription: string;
  readonly benefits: readonly string[];
  readonly chooseHref: string;
};

export const MEMBERSHIP_PLANS: readonly MembershipPlan[] = [
  {
    id: 'mercury',
    name: 'Mercury Membership',
    monthlyPriceGbp: 75,
    monthlyPriceLabel: '£75 per month',
    hours: 3,
    hoursLabel: '3 hours',
    shortDescription:
      'Suitable for occasional Chaperone, Mentor, activity or community engagement support.',
    benefits: [
      '3 hours of eligible CAMS support per subscription month',
      'CAMS Membership remains even if you pause paid support later',
      'Book CAMS Chaperone, Mentor, activity or community support',
      'Family account and Member Portal access',
    ],
    chooseHref: `${ROUTES.REGISTER}?role=parent&intent=buy-package&package=mercury&redirect=${encodeURIComponent(ROUTES.PACKAGES)}`,
  },
  {
    id: 'venus',
    name: 'Venus Membership',
    monthlyPriceGbp: 145,
    monthlyPriceLabel: '£145 per month',
    hours: 6,
    hoursLabel: '6 hours',
    shortDescription:
      'Suitable for families requiring additional planned CAMS support throughout the month.',
    benefits: [
      '6 hours of eligible CAMS support per subscription month',
      'CAMS Membership remains even if you pause paid support later',
      'Book CAMS Chaperone, Mentor, activity or community support',
      'Family account and Member Portal access',
    ],
    chooseHref: `${ROUTES.REGISTER}?role=parent&intent=buy-package&package=venus&redirect=${encodeURIComponent(ROUTES.PACKAGES)}`,
  },
  {
    id: 'earth',
    name: 'Earth Membership',
    monthlyPriceGbp: 210,
    monthlyPriceLabel: '£210 per month',
    hours: 9,
    hoursLabel: '9 hours',
    shortDescription:
      'Suitable for families requiring regular Chaperone, Mentor, activity or community support.',
    benefits: [
      '9 hours of eligible CAMS support per subscription month',
      'CAMS Membership remains even if you pause paid support later',
      'Book CAMS Chaperone, Mentor, activity or community support',
      'Family account and Member Portal access',
    ],
    chooseHref: `${ROUTES.REGISTER}?role=parent&intent=buy-package&package=earth&redirect=${encodeURIComponent(ROUTES.PACKAGES)}`,
  },
  {
    id: 'jupiter',
    name: 'Jupiter Membership',
    monthlyPriceGbp: 270,
    monthlyPriceLabel: '£270 per month',
    hours: 12,
    hoursLabel: '12 hours',
    shortDescription:
      'Suitable for families wanting the highest standard monthly allocation of CAMS support.',
    benefits: [
      '12 hours of eligible CAMS support per subscription month',
      'CAMS Membership remains even if you pause paid support later',
      'Book CAMS Chaperone, Mentor, activity or community support',
      'Family account and Member Portal access',
    ],
    chooseHref: `${ROUTES.REGISTER}?role=parent&intent=buy-package&package=jupiter&redirect=${encodeURIComponent(ROUTES.PACKAGES)}`,
  },
];

export const MEMBERSHIP_PRICE_LABELS: Readonly<Record<MembershipTierId, string>> = {
  mercury: '£75 per month',
  venus: '£145 per month',
  earth: '£210 per month',
  jupiter: '£270 per month',
};

export const MEMBERSHIP_STAYS_COPY =
  'Your CAMS Membership stays with you. Your Support Subscription can change as your family’s needs change.';

export const FLEXIBLE_SUPPORT_HEADING = 'Flexible Monthly Support';

export const FLEXIBLE_SUPPORT_INTRO =
  'CAMS Members can choose the level of support that suits their family’s current needs. Your monthly Support Subscription determines the number of support hours available during that subscription period.';

export const FLEXIBLE_SUPPORT_POINTS = [
  'Keep their existing subscription',
  'Upgrade their current subscription',
  'Select a lower subscription for the next subscription period',
  'Pause paid support for a future subscription period',
  'Restart paid support',
  'Remain a CAMS Member during a period without paid support',
] as const;

export const FLEXIBLE_SUPPORT_FOOTER =
  'A CAMS Member does not have to purchase support every month to retain eligible membership and portal access.';

export const FLEXIBILITY_EXAMPLE = [
  { month: 'September', plan: 'Jupiter Membership', price: '£270', hours: '12 hours' },
  { month: 'October', plan: 'Earth Membership', price: '£210', hours: '9 hours' },
  {
    month: 'November',
    plan: 'Support Subscription paused',
    price: '£0 Support Subscription payment',
    hours: '0 support hours — CAMS Membership remains active',
  },
  { month: 'December', plan: 'Venus Membership', price: '£145', hours: '6 hours' },
] as const;

export const USE_REMAINING_HOURS_COPY =
  'CAMS Members may request to use all or part of their remaining monthly support allocation within one session. Requests must normally be submitted at least 24 hours before the requested session and remain subject to CAMS Services Ltd assessment, safeguarding requirements, suitable CAMS staff availability and approval.';

export const WAITING_TIME_COPY =
  'Where CAMS staff attend an agreed session at the arranged time and are required to wait because the family or young person is delayed, unavailable or not ready, CAMS Services Ltd reserves the right to treat up to 1 hour of reasonable waiting time as part of the booked support period and deduct that time from the member’s available Support Subscription hours.';

export const HOUR_EXPIRY_COPY =
  'Support Subscription hours apply to the subscription period in which they are allocated. Unused standard subscription hours expire at the end of that subscription period. They do not automatically roll over into the next subscription period.';

export const COMMUNITY_TRAVEL_COPY =
  'Where appropriate to an agreed support plan, a CAMS Chaperone or Mentor may accompany a child or young person while accessing agreed community activities, appointments, sporting activities, recreational activities or other planned engagement. Travel taking place during an agreed CAMS support session forms part of the wider Chaperone, Mentor or activity support being provided and remains subject to assessment, safeguarding arrangements, insurance, risk assessment and applicable law.';

export const AGE_AND_ASSESSMENT_COPY = `The CAMS Membership and Support Subscription service is available for children and young people aged ${CAMS_MEMBERSHIP_MIN_AGE} years and above. Support remains subject to CAMS Services Ltd assessment, safeguarding requirements, identified risks, suitable CAMS staff and service availability.`;

export const ELIGIBLE_SUPPORT = [
  'Chaperone support',
  'Mentor support',
  'One to one engagement',
  'Community participation',
  'Activity engagement',
  'Sporting activities',
  'Recreational activities',
  'Social participation',
  'Confidence building',
  'Independence support',
  'Life skills activities',
  'Structured outings',
  'SEND informed support where suitable',
  'Family support activities',
  'Community based engagement',
  'Support around agreed appointments',
  'Positive engagement activities',
  'Agreed individual support objectives',
] as const;

export const STAFF_TERMS = [
  'CAMS Chaperone',
  'CAMS Mentor',
  'CAMS Chaperone and Mentor',
  'CAMS Staff',
  'CAMS Support',
] as const;

export type SubscriptionUpgrade = {
  readonly from: MembershipTierId;
  readonly to: MembershipTierId;
  readonly extraGbp: number;
  readonly hoursFrom: number;
  readonly hoursTo: number;
};

export const SUBSCRIPTION_UPGRADES: readonly SubscriptionUpgrade[] = [
  { from: 'mercury', to: 'venus', extraGbp: 70, hoursFrom: 3, hoursTo: 6 },
  { from: 'mercury', to: 'earth', extraGbp: 135, hoursFrom: 3, hoursTo: 9 },
  { from: 'mercury', to: 'jupiter', extraGbp: 195, hoursFrom: 3, hoursTo: 12 },
  { from: 'venus', to: 'earth', extraGbp: 65, hoursFrom: 6, hoursTo: 9 },
  { from: 'venus', to: 'jupiter', extraGbp: 125, hoursFrom: 6, hoursTo: 12 },
  { from: 'earth', to: 'jupiter', extraGbp: 60, hoursFrom: 9, hoursTo: 12 },
];

export const CHECKOUT_DISCLOSURES = [
  'Membership selected',
  'Subscription package',
  'Monthly price',
  'Included support hours',
  'Subscription start date',
  'Subscription period',
  'Next billing date',
  'Recurring payment information',
  'Hour expiry information',
  'Waiting time rule',
  'Use all remaining hours rule',
  'Upgrade information',
  'Future downgrade information',
  'Pause information',
  'Cancellation information',
  'Applicable cooling off information',
  'Membership Terms',
  'Subscription Terms',
  'Privacy Notice',
  'Safeguarding information',
  'Payment method',
] as const;

export const EARLY_SERVICE_REQUEST_LABEL =
  'I request CAMS Services Ltd to begin providing my selected support during the applicable cancellation period.';

export const CHECKOUT_CTA_LABEL = 'Start My CAMS Monthly Subscription';
export const CHOOSE_MEMBERSHIP_LABEL = 'Choose Membership';
export const RESTART_SUPPORT_LABEL = 'Restart Support';
export const PAUSE_SUPPORT_LABEL = 'Pause Support Subscription';

export const PORTAL_ACCOUNT_ACTIONS = [
  { href: ROUTES.PACKAGES, label: 'Change Subscription' },
  { href: `${ROUTES.PACKAGES}#upgrades`, label: 'Upgrade Subscription' },
  { href: `${ROUTES.PACKAGES}#flexible-support`, label: 'Choose Next Subscription' },
  { href: ROUTES.DASHBOARD_PARENT_BILLING, label: 'Pause Support' },
  { href: ROUTES.PACKAGES, label: 'Restart Support' },
  { href: ROUTES.DASHBOARD_PARENT_BILLING, label: 'Manage Payment Method' },
  { href: ROUTES.CONTACT, label: 'End CAMS Membership' },
] as const;

export function getMembershipPlan(id: MembershipTierId): MembershipPlan {
  const plan = MEMBERSHIP_PLANS.find((item) => item.id === id);
  if (!plan) {
    throw new Error(`Unknown membership plan: ${id}`);
  }
  return plan;
}
