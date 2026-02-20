/**
 * Builds the home page sections map from config and data.
 * Keeps HomePageClient thin — no inline section JSX in the page component.
 */

import React from 'react';
import CTASection from '@/components/shared/CTASection';
import {
  HeroSection,
  HowItWorksSection,
  ServicesSection,
  PackagesSection,
  ImpactStatsSection,
  TestimonialsSection,
  BlogSection,
} from '@/components/home';
import { ROUTES } from '@/utils/routes';
import type { HomePageSection } from '@/core/domain/pages/valueObjects/homePageSections';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import type { ServiceDTO } from '@/core/application/services';
import type { TestimonialDTO } from '@/core/application/testimonials';
import type { ReviewProviderSummary } from '@/interfaces/web/hooks/reviews/useReviewAggregate';
import {
  DEFAULT_HERO,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_PACKAGES_SECTION,
  DEFAULT_IMPACT_SECTION,
  DEFAULT_TESTIMONIALS_SECTION,
  DEFAULT_BLOG_SECTION,
  DEFAULT_CTA_SECTION,
  toCTAButton,
  toOptionalCTAButton,
} from './homePageDefaults';

export interface HomeSectionsMapParams {
  showHero: boolean;
  showHowItWorks: boolean;
  showServices: boolean;
  showPackages: boolean;
  showImpactStats: boolean;
  showTestimonials: boolean;
  showBlog: boolean;
  showCTA: boolean;
  heroConfig: Record<string, unknown> & { backgroundVideoUrl?: string };
  howItWorksConfig: { title?: string; subtitle?: string; steps: Array<{ title: string; description?: string; icon?: string }> };
  servicesConfig: { title?: string; subtitle?: string; viewAllLabel?: string; viewAllHref?: string };
  packagesConfig: { title?: string; subtitle?: string; viewAllLabel?: string; viewAllHref?: string };
  impactConfig: { title?: string; subtitle?: string };
  testimonialsConfig: { title?: string; subtitle?: string };
  blogConfig: { title?: string; subtitle?: string };
  ctaConfig: { title: string; subtitle?: string; primaryCta?: { label: string; href: string }; secondaryCta?: { label: string; href: string } };
  impactStats: Array<{ label: string; value: string; icon?: string }>;
  providerSummaries: ReviewProviderSummary[];
  reviewAggregateLoading: boolean;
  siteSettingsLoading: boolean;
  highlightedServices: ServiceDTO[];
  showServicesSkeleton: boolean;
  servicesError: Error | null;
  packagesToRender: PackageDTO[];
  effectivePackages: PackageDTO[];
  packagesLoading: boolean;
  packagesError: Error | null;
  testimonialsToRender: TestimonialDTO[];
  testimonialsLimit: number;
  testimonialsLoading: boolean;
  testimonialsError: Error | null;
  blogPosts: unknown[];
  blogLimit: number;
  blogLoading: boolean;
}

export function buildHomeSectionsMap(params: HomeSectionsMapParams): Record<HomePageSection['type'], React.ReactNode | null> {
  const {
    showHero,
    showHowItWorks,
    showServices,
    showPackages,
    showImpactStats,
    showTestimonials,
    showBlog,
    showCTA,
    heroConfig,
    howItWorksConfig,
    servicesConfig,
    packagesConfig,
    impactConfig,
    testimonialsConfig,
    blogConfig,
    ctaConfig,
    impactStats,
    providerSummaries,
    reviewAggregateLoading,
    siteSettingsLoading,
    highlightedServices,
    showServicesSkeleton,
    servicesError,
    packagesToRender,
    effectivePackages,
    packagesLoading,
    packagesError,
    testimonialsToRender,
    testimonialsLimit,
    testimonialsLoading,
    testimonialsError,
    blogPosts,
    blogLimit,
    blogLoading,
  } = params;

  const primaryCta = ctaConfig.primaryCta ?? DEFAULT_CTA_SECTION.primaryCta ?? { label: 'Book FREE Consultation', href: ROUTES.CONTACT };
  const normalizedPrimaryCta = toCTAButton(primaryCta);
  const normalizedSecondaryCta = toOptionalCTAButton(ctaConfig.secondaryCta ?? DEFAULT_CTA_SECTION.secondaryCta);

  return {
    hero: showHero ? (
      <HeroSection
        config={{ ...heroConfig, backgroundVideoUrl: heroConfig.backgroundVideoUrl ?? DEFAULT_HERO.backgroundVideoUrl } as Parameters<typeof HeroSection>[0]['config']}
        impactStats={impactStats}
        providerSummaries={providerSummaries}
        isReviewAggregateLoading={reviewAggregateLoading}
        isSiteSettingsLoading={siteSettingsLoading}
      />
    ) : null,
    how_it_works: showHowItWorks ? (
      <HowItWorksSection config={{ title: howItWorksConfig.title ?? DEFAULT_HOW_IT_WORKS.title!, subtitle: howItWorksConfig.subtitle, steps: howItWorksConfig.steps }} />
    ) : null,
    services_highlight: showServices ? (
      <ServicesSection
        config={{
          title: servicesConfig.title ?? DEFAULT_SERVICES_SECTION.title ?? 'Our Specialist Services',
          subtitle: servicesConfig.subtitle,
          viewAllLabel: servicesConfig.viewAllLabel ?? DEFAULT_SERVICES_SECTION.viewAllLabel ?? 'View All Services',
          viewAllHref: servicesConfig.viewAllHref ?? DEFAULT_SERVICES_SECTION.viewAllHref ?? ROUTES.SERVICES,
        }}
        services={highlightedServices}
        isLoading={showServicesSkeleton}
        error={servicesError}
      />
    ) : null,
    packages_highlight: showPackages ? (
      <PackagesSection
        config={{
          title: packagesConfig.title ?? DEFAULT_PACKAGES_SECTION.title!,
          subtitle: packagesConfig.subtitle,
          viewAllLabel: packagesConfig.viewAllLabel ?? DEFAULT_PACKAGES_SECTION.viewAllLabel!,
          viewAllHref: packagesConfig.viewAllHref ?? DEFAULT_PACKAGES_SECTION.viewAllHref!,
        }}
        packages={packagesToRender}
        allPackages={effectivePackages}
        isLoading={packagesLoading && effectivePackages.length === 0}
        error={packagesError}
      />
    ) : null,
    impact_stats: showImpactStats ? (
      <ImpactStatsSection config={{ title: impactConfig.title ?? DEFAULT_IMPACT_SECTION.title!, subtitle: impactConfig.subtitle }} stats={impactStats} />
    ) : null,
    testimonials: showTestimonials ? (
      <TestimonialsSection
        config={{ title: testimonialsConfig.title ?? DEFAULT_TESTIMONIALS_SECTION.title!, subtitle: testimonialsConfig.subtitle, limit: testimonialsLimit }}
        testimonials={testimonialsToRender}
        isLoading={testimonialsLoading}
        error={testimonialsError}
      />
    ) : null,
    blog: showBlog ? (
      <BlogSection
        config={{ title: blogConfig.title ?? DEFAULT_BLOG_SECTION.title!, subtitle: blogConfig.subtitle, limit: blogLimit }}
        posts={blogPosts as Parameters<typeof BlogSection>[0]['posts']}
        isLoading={blogLoading}
      />
    ) : null,
    cta: showCTA ? (
      <CTASection
        title={ctaConfig.title}
        subtitle={ctaConfig.subtitle ?? ''}
        primaryCTA={normalizedPrimaryCta}
        secondaryCTA={normalizedSecondaryCta}
        variant="default"
      />
    ) : null,
  };
}
