/**
 * Policies index page — hero, metadata, fallbacks, and content editor labels.
 */

export const POLICIES_PAGE = {
  META_TITLE: 'Policies & Legal',
  META_DESCRIPTION:
    'Terms of service, privacy policy, safeguarding, cancellation, and other policies for CAMS services.',
  META_DESCRIPTION_OG: 'Terms of service, privacy policy, safeguarding, and other policies.',
  HERO_TITLE: 'Policies & Legal',
  HERO_SUBTITLE:
    'Important documents including terms of service, privacy, safeguarding, and refunds.',
  /** Fallbacks when structuredContent.hero is empty. */
  FALLBACK_HERO_TITLE: 'Policies & Legal',
  FALLBACK_HERO_SUBTITLE:
    'Important documents including terms of service, privacy, safeguarding, and refunds.',
  DEFAULT_INTRO_HEADING: 'Our policies',
  DEFAULT_INTRO_BODY:
    'CAMS services Ltd maintains clear, accessible policies so families, schools, and commissioning teams understand how we handle data, safeguarding, cancellations, cookies, and payments. Our documents follow UK compliance requirements including GDPR, safeguarding statutory guidance, and consumer rights for service bookings. Select a policy below to read the full text. For questions about how a policy applies to your referral or package, contact info@camsservices.co.uk and we will direct you to the right team member.',
  EMPTY_MESSAGE: 'No published policies are available at the moment.',
  EMPTY_CONTACT: 'You can still reach us at',
  EMPTY_CONTACT_SUFFIX: 'for any questions.',
  CONTACT_EMAIL: 'info@camsservices.co.uk',
  CONTACT_EMAIL_MAILTO: 'mailto:info@camsservices.co.uk',
} as const;

/** Policies content editor section headings and field labels (dashboard). */
export const POLICIES_EDITOR = {
  LOADING: 'Loading policies page content…',
  SAVE_ERROR: 'Failed to save. Please try again.',
  TOAST_SUCCESS: 'Policies page content saved.',
  TOAST_VIEW_LIVE: 'View live page',
  BANNER_HEADING: 'Hero',
  BANNER_TITLE_LABEL: 'Hero title',
  BANNER_SUBTITLE_LABEL: 'Hero subtitle',
  INTRO_HEADING: 'Intro (e.g. UK compliance)',
  INTRO_HEADING_LABEL: 'Intro heading',
  INTRO_BODY_LABEL: 'Intro body text',
} as const;
