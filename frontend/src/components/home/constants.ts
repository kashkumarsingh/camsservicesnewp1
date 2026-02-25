/**
 * Default UI strings for home page sections.
 * Never hardcode these in JSX — use these constants or config from CMS.
 */

/** Tailwind icon colour classes for Impact stats (cycle by index). Theme tokens only. */
export const IMPACT_ICON_COLORS = ['text-primary-blue', 'text-light-blue-cyan', 'text-star-gold', 'text-orbital-green'] as const;

/** Step header gradient classes for How it works (order: step 1, 2, 3). Theme tokens only. */
export const HOW_IT_WORKS_GRADIENTS = [
  'from-primary-blue to-light-blue-cyan',
  'from-galaxy-purple to-primary-blue',
  'from-star-gold to-orbital-green',
] as const;

/** Step badge classes for How it works (order: step 1, 2, 3). */
export const HOW_IT_WORKS_BADGE_CLASSES = [
  'bg-primary-blue text-white',
  'bg-galaxy-purple text-white',
  'bg-star-gold text-navy-blue',
] as const;

/** Service card header gradient classes (alternate by index). */
export const SERVICE_CARD_GRADIENTS = [
  'from-primary-blue to-light-blue-cyan',
  'from-galaxy-purple to-primary-blue',
] as const;

export const DEFAULT_HOME_STRINGS = {
  HERO_BADGE_DBS: 'DBS Checked',
  HERO_BADGE_SATISFACTION: '98% Satisfaction',
  HERO_BADGE_AWARD: 'Award Winning',
  LOADING_REVIEWS: 'Loading reviews…',
  QUICK_START: 'Quick Start',
  READY_TO_GET_STARTED: 'Ready to Get Started?',
  QUICK_START_DESCRIPTION: 'Get approved, purchase your package, then book sessions at your pace',
  VIEW_ALL_PACKAGES: 'View All Packages',
  TRUST_DBS_STAFF: 'DBS Checked Staff',
  TRUST_SATISFACTION_RATE: '98% Satisfaction Rate',
  TRUST_AWARD_WINNING: 'Award Winning Service',
  BOOK_FREE_CONSULTATION: 'Book FREE Consultation',
  SERVICES_EMPTY_MESSAGE: 'Services coming soon. Check back later!',
  SERVICES_LOAD_ERROR: 'Unable to load services right now. Please try again shortly.',
  SERVICES_LEARN_MORE: 'Learn More',
  PACKAGES_LOAD_ERROR: 'Unable to load packages. Please try again.',
  PACKAGES_LOAD_ERROR_FALLBACK: 'Unable to load packages right now.',
  PACKAGES_EMPTY_MESSAGE: 'No packages available at the moment. Check back soon or get in touch.',
} as const;
