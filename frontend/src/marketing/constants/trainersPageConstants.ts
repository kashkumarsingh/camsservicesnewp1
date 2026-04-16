/**
 * Trainers list page — hero, stats, section, join block, CTA and metadata copy.
 * Shared for marketing components outside route modules.
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
