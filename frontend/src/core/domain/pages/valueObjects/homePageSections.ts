export type HomePageSection =
  | HeroSection
  | HowItWorksSection
  | ImpactStatsSection
  | ServicesHighlightSection
  | PackagesHighlightSection
  | TestimonialsSection
  | BlogSection
  | CTASection;

export interface CTAConfig {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface HeroSection {
  type: 'hero';
  data: {
    badgeText?: string;
    badgeIcon?: string;
    heading: string;
    subheading?: string;
    primaryCta?: CTAConfig;
    secondaryCta?: CTAConfig;
    backgroundVideoUrl?: string;
    backgroundImageUrl?: string;
    showTrustIndicators?: boolean;
  };
}

export interface HowItWorksSection {
  type: 'how_it_works';
  data: {
    title?: string;
    subtitle?: string;
    steps: Array<{
      title: string;
      description?: string;
      icon?: string;
    }>;
    cta?: CTAConfig;
  };
}

export interface ImpactStatsSection {
  type: 'impact_stats';
  data: {
    title?: string;
    subtitle?: string;
    stats?: Array<{
      label: string;
      value: string;
      icon?: string;
    }>;
  };
}

export interface ServicesHighlightSection {
  type: 'services_highlight';
  data: {
    title?: string;
    subtitle?: string;
    serviceSlugs?: string[];
    viewAllLabel?: string;
    viewAllHref?: string;
  };
}

export interface PackagesHighlightSection {
  type: 'packages_highlight';
  data: {
    title?: string;
    subtitle?: string;
    packageSlugs?: string[];
    viewAllLabel?: string;
    viewAllHref?: string;
  };
}

export interface TestimonialsSection {
  type: 'testimonials';
  data: {
    title?: string;
    subtitle?: string;
    limit?: number;
  };
}

export interface BlogSection {
  type: 'blog';
  data: {
    title?: string;
    subtitle?: string;
    limit?: number;
  };
}

export interface CTASection {
  type: 'cta';
  data: {
    title: string;
    subtitle?: string;
    primaryCta?: CTAConfig;
    secondaryCta?: CTAConfig;
  };
}

export function isHeroSection(section: HomePageSection): section is HeroSection {
  return section.type === 'hero';
}

export function isHowItWorksSection(section: HomePageSection): section is HowItWorksSection {
  return section.type === 'how_it_works';
}

export function isImpactStatsSection(section: HomePageSection): section is ImpactStatsSection {
  return section.type === 'impact_stats';
}

export function isServicesHighlightSection(section: HomePageSection): section is ServicesHighlightSection {
  return section.type === 'services_highlight';
}

export function isPackagesHighlightSection(section: HomePageSection): section is PackagesHighlightSection {
  return section.type === 'packages_highlight';
}

export function isTestimonialsSection(section: HomePageSection): section is TestimonialsSection {
  return section.type === 'testimonials';
}

export function isBlogSection(section: HomePageSection): section is BlogSection {
  return section.type === 'blog';
}

export function isCTASection(section: HomePageSection): section is CTASection {
  return section.type === 'cta';
}

