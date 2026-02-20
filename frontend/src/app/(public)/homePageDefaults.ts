/**
 * Default section config and helpers for HomePageClient.
 * Single source for CMS fallbacks — do not duplicate in page component.
 */

import { ROUTES } from '@/utils/routes';
import type {
  HomePageSection,
  CTAConfig,
  HeroSection,
  HowItWorksSection,
  ImpactStatsSection,
  ServicesHighlightSection,
  PackagesHighlightSection,
  TestimonialsSection,
  BlogSection,
  CTASection,
} from '@/core/domain/pages/valueObjects/homePageSections';

export const DEFAULT_HERO: HeroSection['data'] = {
  badgeText: 'Trusted by 500+ Families Since 2014',
  heading: "Transform Your Child's Future",
  subheading: 'Specialist SEN & trauma-informed care that empowers children to thrive',
  primaryCta: { label: 'Book FREE Consultation', href: ROUTES.CONTACT, variant: 'primary' },
  secondaryCta: { label: 'See How It Works', href: '#how-it-works', variant: 'outline' },
  backgroundVideoUrl: '/videos/space-bg-2.mp4',
};

export const DEFAULT_HOW_IT_WORKS: HowItWorksSection['data'] = {
  title: 'How It Works',
  subtitle: "Getting started is simple. Just three easy steps to transform your child's journey.",
  steps: [
    { title: 'Book FREE Consultation', description: "Share your child's needs, strengths, and goals. Get approved to start your journey.", icon: 'phone' },
    { title: 'Purchase Your Package', description: 'Choose the perfect package for your family. Pay once, then book sessions at your pace.', icon: 'calendar' },
    { title: 'Book Sessions & Thrive', description: 'Book sessions from your dashboard when ready. Watch your child progress with evidence-based support.', icon: 'sparkles' },
  ],
};

export const DEFAULT_SERVICES_SECTION: ServicesHighlightSection['data'] = {
  title: 'Our Specialist Services',
  subtitle: 'Evidence-based support tailored to your child\'s unique needs',
  viewAllLabel: 'View All Services',
  viewAllHref: ROUTES.SERVICES,
};

export const DEFAULT_PACKAGES_SECTION: PackagesHighlightSection['data'] = {
  title: 'Flexible Care Packages',
  subtitle: 'Choose the perfect package for your family. All include DBS-checked staff, personalized plans, and ongoing support.',
  viewAllLabel: 'Compare All Packages',
  viewAllHref: ROUTES.PACKAGES,
};

export const DEFAULT_IMPACT_SECTION: ImpactStatsSection['data'] = {
  title: 'Our Impact',
  subtitle: "Real results that make a difference in children's lives",
};

/** Fallback impact stats when no CMS/site settings — single source of truth (no hardcoding in page). */
export const DEFAULT_IMPACT_STATS: Array<{ label: string; value: string; icon?: string }> = [
  { label: 'Families Supported', value: '500+', icon: 'users' },
  { label: 'DBS-Checked Professionals', value: '100%', icon: 'shield' },
  { label: 'Average Satisfaction', value: '98%', icon: 'star' },
  { label: 'Years of Expertise', value: '10+', icon: 'clock' },
];

export function getEffectiveImpactStats(
  impactSection: ImpactStatsSection | undefined,
  siteSettings: { settings?: { trustIndicators?: Array<{ label: string; value: string; icon?: string }> } }
): Array<{ label: string; value: string; icon?: string }> {
  if (impactSection?.data?.stats?.length) return impactSection.data.stats;
  const siteStats = siteSettings.settings?.trustIndicators?.map((i) => ({
    label: i.label,
    value: i.value,
    icon: i.icon,
  }));
  return siteStats?.slice(0, 4) ?? DEFAULT_IMPACT_STATS;
}

export const DEFAULT_TESTIMONIALS_SECTION: TestimonialsSection['data'] = {
  title: 'What Families Say',
  subtitle: "Don't just take our word for it - hear from the families we've helped",
  limit: 6,
};

export const DEFAULT_BLOG_SECTION: BlogSection['data'] = {
  title: 'Latest from Our Blog',
  subtitle: 'Expert insights, tips, and stories to support your parenting journey',
  limit: 3,
};

export const DEFAULT_CTA_SECTION: CTASection['data'] = {
  title: 'Ready to Transform Your Child\'s Future?',
  subtitle: 'Book your FREE consultation today and discover how we can help your child thrive',
  primaryCta: { label: 'Book FREE Consultation', href: ROUTES.CONTACT },
  secondaryCta: { label: 'View All Packages', href: ROUTES.PACKAGES },
};

export const DEFAULT_SECTION_SEQUENCE: HomePageSection['type'][] = [
  'hero', 'how_it_works', 'services_highlight', 'packages_highlight', 'impact_stats', 'testimonials', 'blog', 'cta',
];

export const toCTAButton = (cta: CTAConfig) => ({ text: cta.label, href: cta.href });
export const toOptionalCTAButton = (cta?: CTAConfig) => (cta ? toCTAButton(cta) : undefined);
