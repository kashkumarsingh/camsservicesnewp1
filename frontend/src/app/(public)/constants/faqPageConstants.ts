/**
 * FAQ page — hero, intro, CTA and metadata copy.
 * Used as fallbacks when structuredContent is empty (Public Pages Content Management).
 */

export const FAQ_PAGE = {
  META_TITLE: 'Frequently Asked Questions - CAMS Services',
  META_DESCRIPTION:
    'Find answers to common questions about CAMS Services, our packages, and support.',
  HERO_TITLE: 'Frequently Asked Questions',
  HERO_SUBTITLE: 'Find answers to common questions about CAMS Services, our packages, and support.',
  HERO_CTA_QUESTIONS: 'Still Have Questions?',
  HERO_CTA_SERVICES: 'Explore Our Services',
  INTRO_HEADING: '',
  INTRO_BODY: '',
  CTA_TITLE: "Didn't Find What You're Looking For?",
  CTA_SUBTITLE: "Our team is here to help! Contact us and we'll answer any questions you have.",
  CTA_PRIMARY: 'Contact Us Today',
  CTA_SECONDARY: 'View Our Packages',
} as const;

/** Default hero video path for FAQ page (content management). */
export const FAQ_PAGE_HERO_DEFAULT_VIDEO = '/videos/space-bg-2.mp4';

/** FAQ content editor section headings and field labels (dashboard). */
export const FAQ_EDITOR = {
  LOADING: 'Loading FAQ page content…',
  SAVE_ERROR: 'Failed to save. Please try again.',
  TOAST_SUCCESS: 'FAQ page content saved.',
  TOAST_VIEW_LIVE: 'View live page',
  HERO_HEADING: 'Hero',
  HERO_TITLE_LABEL: 'Hero title',
  HERO_SUBTITLE_LABEL: 'Hero subtitle',
  HERO_CTA_PRIMARY: 'Primary button text',
  HERO_CTA_SECONDARY: 'Secondary button text',
  INTRO_HEADING: 'Intro section',
  INTRO_HEADING_LABEL: 'Intro heading (optional)',
  INTRO_BODY_LABEL: 'Intro body (optional)',
  ITEMS_HEADING: 'Questions & Answers',
  ITEMS_NOTE: 'Add questions and answers below. If empty, the page will show FAQs from the FAQ table (Manage FAQs).',
  CTA_HEADING: 'Bottom CTA block',
  CTA_TITLE_LABEL: 'CTA title',
  CTA_SUBTITLE_LABEL: 'CTA subtitle',
  CTA_PRIMARY_LABEL: 'Primary button text',
  CTA_SECONDARY_LABEL: 'Secondary button text',
} as const;
