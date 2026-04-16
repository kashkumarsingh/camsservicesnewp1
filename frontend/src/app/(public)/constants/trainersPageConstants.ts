/**
 * Trainers list page — hero, stats, section, join block, CTA and metadata copy.
 * Used as fallbacks when structuredContent is empty (Public Pages Content Management).
 */

export const TRAINERS_PAGE = {
  META_TITLE: 'Our Trainers - CAMS Services',
  META_DESCRIPTION:
    'Meet our team of DBS-checked, specialist trainers delivering trauma-informed support across London and Essex.',
  HERO_TITLE: 'Meet Our Trainers',
  HERO_SUBTITLE: 'DBS-checked specialists ready to support your child',
  HERO_CTA_PRIMARY: 'Get in Touch',
  HERO_CTA_SECONDARY: 'Explore Our Services',
  STATS_MENTORS_LABEL: 'Expert Mentors',
  STATS_RATING_LABEL: 'Average Rating',
  STATS_DBS_LABEL: '100% DBS Checked',
  SECTION_TITLE: 'Our Team',
  SECTION_SUBTITLE: "Experienced, qualified and passionate about every child's potential",
  JOIN_TITLE: 'Interested in Joining Our Team?',
  JOIN_SUBTITLE:
    "Are you passionate about helping children thrive? We're always looking for dedicated, qualified trainers to join our growing team of specialists.",
  JOIN_CTA_PRIMARY: 'Become a Trainer',
  JOIN_CTA_SECONDARY: 'Start Application',
  JOIN_CONTACT_EMAIL_TEXT: 'Questions? Email us at',
  CTA_TITLE: 'Ready to Connect with Our Team?',
  CTA_SUBTITLE: 'Contact us today to discuss how our dedicated mentors can support your child.',
  CTA_PRIMARY: 'Book a Free Consultation',
  CTA_SECONDARY: 'Email Our Team',
} as const;

/** Trainers content editor section headings and field labels (dashboard). */
export const TRAINERS_EDITOR = {
  LOADING: 'Loading trainers page content…',
  SAVE_ERROR: 'Failed to save. Please try again.',
  TOAST_SUCCESS: 'Trainers page content saved.',
  TOAST_VIEW_LIVE: 'View live page',
  HERO_HEADING: 'Hero',
  HERO_TITLE_LABEL: 'Hero title',
  HERO_SUBTITLE_LABEL: 'Hero subtitle',
  HERO_CTA_PRIMARY_LABEL: 'Primary button text',
  HERO_CTA_PRIMARY_HREF_LABEL: 'Primary button link (e.g. /contact)',
  HERO_CTA_SECONDARY_LABEL: 'Secondary button text',
  HERO_CTA_SECONDARY_HREF_LABEL: 'Secondary button link (e.g. /services)',
  STATS_HEADING: 'Stats strip',
  STATS_MENTORS_LABEL: 'Label for trainer count (e.g. Expert Mentors)',
  STATS_RATING_LABEL: 'Label for average rating',
  STATS_DBS_LABEL: 'Label for DBS (e.g. 100% DBS Checked)',
  SECTION_HEADING: 'Our Team section',
  SECTION_TITLE_LABEL: 'Section title',
  SECTION_SUBTITLE_LABEL: 'Section subtitle',
  JOIN_HEADING: 'Join our team block',
  JOIN_TITLE_LABEL: 'Block title',
  JOIN_SUBTITLE_LABEL: 'Intro paragraph',
  JOIN_CTA_PRIMARY_LABEL: 'Primary CTA text (e.g. Become a Trainer)',
  JOIN_CTA_PRIMARY_HREF_LABEL: 'Primary CTA link (e.g. /become-a-trainer)',
  JOIN_CTA_SECONDARY_LABEL: 'Secondary CTA text (e.g. Start Application)',
  JOIN_CTA_SECONDARY_HREF_LABEL: 'Secondary CTA link (e.g. /become-a-trainer#application-form)',
  JOIN_CONTACT_EMAIL_LABEL: 'Contact line prefix (e.g. Questions? Email us at)',
  CTA_HEADING: 'Bottom CTA block',
  CTA_TITLE_LABEL: 'CTA title',
  CTA_SUBTITLE_LABEL: 'CTA subtitle',
  CTA_PRIMARY_LABEL: 'Primary button text',
  CTA_PRIMARY_HREF_LABEL: 'Primary button link',
  CTA_SECONDARY_LABEL: 'Secondary button text',
  CTA_SECONDARY_HREF_LABEL: 'Secondary button link',
  PREVIEW_NOTE: 'Trainer cards come from the Trainers table.',
  PREVIEW_MANAGE_LINK: 'Manage trainers',
} as const;

/** Resolved trainers list page content (all strings; used when passing from server to client). */
export interface TrainersPageContentResolved {
  hero: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
  };
  stats: {
    mentorsLabel: string;
    ratingLabel: string;
    dbsLabel: string;
  };
  section: {
    title: string;
    subtitle: string;
  };
  joinSection: {
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaPrimaryHref: string;
    ctaSecondary: string;
    ctaSecondaryHref: string;
    contactEmailText: string;
  };
  cta: {
    title: string;
    subtitle: string;
    primaryText: string;
    primaryHref: string;
    secondaryText: string;
    secondaryHref: string;
  };
}
