export interface PageSectionDTO {
  type: string;
  data: Record<string, unknown>;
}

/** About page: mission block (optional). */
export interface AboutMissionDTO {
  title?: string;
  description?: string;
}

/** About page: one core value card. */
export interface AboutCoreValueDTO {
  icon?: string;
  title: string;
  description: string;
}

/** About page: safeguarding block (optional). */
export interface AboutSafeguardingDTO {
  title?: string;
  subtitle?: string;
  description?: string;
  badges?: string[];
}

/** Hero background: video or image (admin choice). */
export type HeroBackgroundType = 'video' | 'image';

/** Hero button count and size (admin choice). */
export type HeroButtonCount = 0 | 1 | 2;
export type HeroButtonSize = 'sm' | 'md' | 'lg';

/** About page structured content (Public Pages Content Management). Stored in page.content. */
export interface AboutPageContentDTO {
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    /** 'video' | 'image'. When 'image', use imageUrl as background; else videoUrl. */
    backgroundType?: HeroBackgroundType;
    /** Path or URL for video background (e.g. /videos/space-bg-2.mp4). Used when backgroundType is 'video' or as fallback. */
    videoUrl?: string;
    /** Path or URL for image background. Used when backgroundType is 'image'. */
    imageUrl?: string;
    /** 0 = no buttons, 1 = primary only, 2 = both. Default 2. */
    buttonCount?: HeroButtonCount;
    /** Button size: sm, md, lg. Default lg. */
    buttonSize?: HeroButtonSize;
  };
  mission?: {
    sectionTitle?: string;
    description?: string;
    ctaLabel?: string;
    /** Link for the mission CTA button (e.g. /contact). */
    ctaHref?: string;
    imageUrl?: string;
    /** Show CTA button. Default true. */
    showCta?: boolean;
    /** CTA button size: sm, md, lg. Default lg. */
    ctaSize?: HeroButtonSize;
    /** Show image column. Default true. */
    showImage?: boolean;
  };
  coreValues?: {
    sectionTitle?: string;
    sectionSubtitle?: string;
    values?: AboutCoreValueDTO[];
  };
  safeguarding?: {
    title?: string;
    subtitle?: string;
    description?: string;
    badges?: string[];
    secondParagraph?: string;
    ctaLabel?: string;
    imageUrl?: string;
  };
}

/** Contact page structured content (Public Pages Content Management). Stored in page.content by slug "contact". */
export interface ContactPageContentDTO {
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    backgroundType?: 'video' | 'image';
    videoUrl?: string;
    imageUrl?: string;
    buttonCount?: 0 | 1 | 2;
    buttonSize?: 'sm' | 'md' | 'lg';
  };
  /** Optional intro/heading section above the form area. */
  intro?: {
    heading?: string;
    body?: string;
  };
  /** Optional blurb shown above or beside the contact form (e.g. reassurance text). */
  formBlurb?: string;
  /** Sidebar content: why choose us, prefer to talk, office hours. */
  sidebar?: {
    whyTitle?: string;
    benefits?: string[];
    preferTalkTitle?: string;
    preferTalkDescription?: string;
    callNow?: string;
    whatsapp?: string;
    emailUs?: string;
    officeHoursTitle?: string;
    mondayFriday?: string;
    mondayFridayHours?: string;
    saturday?: string;
    saturdayHours?: string;
    sunday?: string;
    sundayHours?: string;
    afterHours?: string;
  };
  /** Visit our centre section content. */
  visit?: {
    title?: string;
    subtitle?: string;
    mapComingSoon?: string;
    mapTitle?: string;
    addressLabel?: string;
    addressPlaceholder?: string;
    getDirections?: string;
    getDirectionsHref?: string;
    parkingLabel?: string;
    parkingDescription?: string;
    bookVisitLabel?: string;
    bookVisitDescription?: string;
    scheduleTour?: string;
  };
}

/** Policies index page structured content (UK compliance / legal). Stored in page.content by slug "policies". */
export interface PoliciesPageContentDTO {
  hero?: {
    title?: string;
    subtitle?: string;
  };
  /** Optional intro above the policy list (e.g. UK compliance statement). */
  intro?: {
    heading?: string;
    body?: string;
  };
}

/** Services list page structured content. Stored in page.content by slug "services". */
export interface ServicesPageContentDTO {
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    backgroundType?: 'video' | 'image';
    videoUrl?: string;
    imageUrl?: string;
    buttonCount?: 0 | 1 | 2;
    buttonSize?: 'sm' | 'md' | 'lg';
  };
  /** Main section (What We Offer): title, subtitle, CTA button. */
  section?: {
    title?: string;
    subtitle?: string;
    cta?: string;
  };
  /** Bottom CTA block. */
  cta?: {
    title?: string;
    subtitle?: string;
    primaryText?: string;
    primaryHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
  };
}

/** Packages list page structured content. Stored in page.content by slug "packages". List copy from content; package items from Packages table. */
export interface PackagesPageContentDTO {
  /** Hero (gradient style on packages list): title, subtitle, single CTA. */
  hero?: {
    title?: string;
    subtitle?: string;
    ctaText?: string;
    ctaHref?: string;
  };
  /** Main section (Available Packages): title, subtitle above the grid. */
  section?: {
    title?: string;
    subtitle?: string;
  };
  /** Help block: "Need help choosing? Book a consultation or call us" + CTA. Phone number from site settings. */
  help?: {
    needText?: string;
    bookText?: string;
    callText?: string;
    ctaText?: string;
    ctaHref?: string;
  };
  /** Compare section: title, subtitle above comparison table. */
  compare?: {
    title?: string;
    subtitle?: string;
  };
  /** FAQ section: heading above FAQ list (category filter from code). */
  faqSection?: {
    title?: string;
  };
}

/** Trainers list page structured content. Stored in page.content by slug "trainers". List copy from content; trainer cards from Trainers API. */
export interface TrainersPageContentDTO {
  /** Hero: title, subtitle, two CTAs. */
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaPrimaryHref?: string;
    ctaSecondary?: string;
    ctaSecondaryHref?: string;
  };
  /** Stats strip labels (values are dynamic from data). */
  stats?: {
    mentorsLabel?: string;
    ratingLabel?: string;
    dbsLabel?: string;
  };
  /** Main section (Our Team grid): title, subtitle. */
  section?: {
    title?: string;
    subtitle?: string;
  };
  /** Join our team block: title, subtitle, two CTAs, email line. */
  joinSection?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaPrimaryHref?: string;
    ctaSecondary?: string;
    ctaSecondaryHref?: string;
    /** e.g. "Questions? Email us at" (email address from site settings or constant). */
    contactEmailText?: string;
  };
  /** Bottom CTA block. */
  cta?: {
    title?: string;
    subtitle?: string;
    primaryText?: string;
    primaryHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
  };
}

/** Blog list page structured content. Stored in page.content by slug "blog". List copy from content; posts from Blog API. */
export interface BlogPageContentDTO {
  /** Hero: title, subtitle, two CTAs. */
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaPrimaryHref?: string;
    ctaSecondary?: string;
    /** e.g. "#featured" for latest articles anchor. */
    ctaSecondaryHref?: string;
  };
  /** Stats strip labels (values are dynamic from post count). */
  stats?: {
    articlesLabel?: string;
    freeResourcesLabel?: string;
  };
  /** Featured article block: heading, badge text, CTA button text. */
  featured?: {
    heading?: string;
    badge?: string;
    cta?: string;
  };
  /** Article list section: "All articles" heading, clear filters button. */
  list?: {
    allArticlesLabel?: string;
    clearFiltersLabel?: string;
  };
  /** Bottom CTA block. */
  cta?: {
    title?: string;
    subtitle?: string;
    primaryText?: string;
    primaryHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
  };
}

/** One FAQ item in page content (question/answer pair). */
export interface FAQPageItemDTO {
  question?: string;
  answer?: string;
}

/** FAQ page structured content. Stored in page.content by slug "faq". Hero + intro + repeater of Q/A + CTA. */
export interface FAQPageContentDTO {
  hero?: {
    title?: string;
    subtitle?: string;
    ctaPrimary?: string;
    ctaSecondary?: string;
    backgroundType?: 'video' | 'image';
    videoUrl?: string;
    imageUrl?: string;
    buttonCount?: 0 | 1 | 2;
    buttonSize?: 'sm' | 'md' | 'lg';
  };
  /** Optional intro above the FAQ list (heading + body). */
  intro?: {
    heading?: string;
    body?: string;
  };
  /** Repeater of Q/A. When present and non-empty, shown instead of FAQs from API. */
  items?: FAQPageItemDTO[];
  /** Bottom CTA block. */
  cta?: {
    title?: string;
    subtitle?: string;
    primaryText?: string;
    primaryHref?: string;
    secondaryText?: string;
    secondaryHref?: string;
  };
}

export interface PageDTO {
  id: string;
  title: string;
  slug: string;
  type: string;
  summary?: string;
  content: string;
  sections?: PageSectionDTO[];
  lastUpdated?: string;
  effectiveDate?: string;
  version: string;
  views: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Only present when type === 'about'. */
  mission?: AboutMissionDTO | null;
  coreValues?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
  /** Public Pages Content Management: type-specific section data (e.g. about, contact, policies, services, packages, faq). */
  structuredContent?:
    | AboutPageContentDTO
    | ContactPageContentDTO
    | PoliciesPageContentDTO
    | ServicesPageContentDTO
    | PackagesPageContentDTO
    | TrainersPageContentDTO
    | BlogPageContentDTO
    | FAQPageContentDTO
    | Record<string, unknown>;
}


