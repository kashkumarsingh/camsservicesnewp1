'use client';

import React, { useMemo } from 'react';
import CTASection from '@/components/shared/CTASection';
import {
  HeroSection as HeroSectionComponent,
  HowItWorksSection as HowItWorksSectionComponent,
  ServicesSection,
  PackagesSection,
  ImpactStatsSection as ImpactStatsSectionComponent,
  TestimonialsSection,
  BlogSection,
} from '@/components/home';
import { useHomePageData } from '@/interfaces/web/hooks/useHomePageData';
import { testimonials as testimonialFallbackData } from '@/data/commonData';
import { mapFallbackTestimonials } from '@/utils/testimonialUtils';
import { ROUTES } from '@/utils/routes';
import {
  type HomePageSection,
  isHeroSection,
  isHowItWorksSection,
  isImpactStatsSection,
  isServicesHighlightSection,
  isPackagesHighlightSection,
  isTestimonialsSection,
  isBlogSection,
  isCTASection,
} from '@/core/domain/pages/valueObjects/homePageSections';
import type { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import type { ServiceDTO } from '@/core/application/services';
import {
  DEFAULT_HERO,
  DEFAULT_HOW_IT_WORKS,
  DEFAULT_SERVICES_SECTION,
  DEFAULT_PACKAGES_SECTION,
  DEFAULT_IMPACT_SECTION,
  DEFAULT_TESTIMONIALS_SECTION,
  DEFAULT_BLOG_SECTION,
  DEFAULT_CTA_SECTION,
  DEFAULT_SECTION_SEQUENCE,
  getEffectiveImpactStats,
  toCTAButton,
  toOptionalCTAButton,
} from '@/app/(public)/homePageDefaults';

export function useHomePageState(
  sections: HomePageSection[],
  packages: PackageDTO[],
  services: ServiceDTO[]
): {
  sectionOrder: HomePageSection['type'][];
  sectionsByType: Record<HomePageSection['type'], React.ReactNode | null>;
} {
  const hasCustomSections = sections.length > 0;
  const heroSection = sections.find(isHeroSection);
  const howItWorksSection = sections.find(isHowItWorksSection);
  const servicesSection = sections.find(isServicesHighlightSection);
  const packagesSection = sections.find(isPackagesHighlightSection);
  const impactSection = sections.find(isImpactStatsSection);
  const testimonialsSection = sections.find(isTestimonialsSection);
  const blogSection = sections.find(isBlogSection);
  const ctaSection = sections.find(isCTASection);

  const testimonialsLimit =
    (testimonialsSection?.data?.limit ?? DEFAULT_TESTIMONIALS_SECTION.limit) ?? 6;
  const blogLimit = (blogSection?.data?.limit ?? DEFAULT_BLOG_SECTION.limit) ?? 3;

  const {
    packages: packagesData,
    posts: blogPostsData,
    services: servicesData,
    testimonials: testimonialsData,
    reviewAggregate,
    siteSettings,
  } = useHomePageData({ blogLimit, testimonialsLimit });

  // Server props are used as fallback when client data is still loading or when the API call fails.
  // This prevents content flash on initial load. Pattern: use client data when available, fall back to server props.
  // Apply this pattern on all CMS pages that pre-fetch data server-side.
  const effectivePackages =
    packagesData.packages.length > 0 ? packagesData.packages : packages;
  const effectiveServices =
    servicesData.services.length > 0 ? servicesData.services : services;

  const heroConfig = useMemo(
    () => ({ ...DEFAULT_HERO, ...(heroSection?.data ?? {}) }),
    [heroSection]
  );
  const howItWorksConfig = useMemo(
    () => ({
      ...DEFAULT_HOW_IT_WORKS,
      ...(howItWorksSection?.data ?? {}),
      steps:
        howItWorksSection?.data?.steps?.length
          ? howItWorksSection.data.steps
          : DEFAULT_HOW_IT_WORKS.steps,
    }),
    [howItWorksSection]
  );
  const servicesConfig = useMemo(() => {
    const data = servicesSection?.data ?? {};
    return {
      title: data.title ?? DEFAULT_SERVICES_SECTION.title,
      subtitle: data.subtitle ?? DEFAULT_SERVICES_SECTION.subtitle,
      viewAllLabel: data.viewAllLabel ?? DEFAULT_SERVICES_SECTION.viewAllLabel,
      viewAllHref: data.viewAllHref ?? DEFAULT_SERVICES_SECTION.viewAllHref,
      serviceSlugs: data.serviceSlugs,
    };
  }, [servicesSection]);
  const packagesConfig = useMemo(
    () => ({ ...DEFAULT_PACKAGES_SECTION, ...(packagesSection?.data ?? {}) }),
    [packagesSection]
  );
  const impactConfig = useMemo(
    () => ({ ...DEFAULT_IMPACT_SECTION, ...(impactSection?.data ?? {}) }),
    [impactSection]
  );
  const testimonialsConfig = useMemo(
    () => ({
      ...DEFAULT_TESTIMONIALS_SECTION,
      ...(testimonialsSection?.data ?? {}),
    }),
    [testimonialsSection]
  );
  const blogConfig = useMemo(
    () => ({ ...DEFAULT_BLOG_SECTION, ...(blogSection?.data ?? {}) }),
    [blogSection]
  );
  const ctaConfig = useMemo(
    () => ({ ...DEFAULT_CTA_SECTION, ...(ctaSection?.data ?? {}) }),
    [ctaSection]
  );

  const impactStats = useMemo(
    () => getEffectiveImpactStats(impactSection, { settings: siteSettings.settings ?? undefined }),
    [impactSection, siteSettings.settings]
  );

  const fallbackTestimonials = useMemo(
    () => mapFallbackTestimonials(testimonialFallbackData),
    []
  );
  const testimonialsToRender = (
    testimonialsData.testimonials.length > 0
      ? testimonialsData.testimonials
      : fallbackTestimonials
  ).slice(0, testimonialsLimit);

  const packagesToRender =
    packagesConfig.packageSlugs?.length && effectivePackages.length > 0
      ? effectivePackages.filter((p) =>
          packagesConfig.packageSlugs?.includes(p.slug)
        )
      : effectivePackages;
  const highlightedServices =
    servicesConfig.serviceSlugs?.length && effectiveServices.length > 0
      ? effectiveServices.filter((s) =>
          servicesConfig.serviceSlugs?.includes(s.slug)
        )
      : effectiveServices.slice(0, 4);

  const showServicesSkeleton =
    (servicesData.loading && effectiveServices.length === 0) ||
    (!!servicesData.error && highlightedServices.length === 0);

  const sectionOrder = hasCustomSections
    ? sections.map((s) => s.type)
    : DEFAULT_SECTION_SEQUENCE;

  const primaryCta =
    ctaConfig.primaryCta ??
    DEFAULT_CTA_SECTION.primaryCta ?? { label: 'Book FREE Consultation', href: ROUTES.CONTACT };
  const normalizedPrimaryCta = toCTAButton(primaryCta);
  const normalizedSecondaryCta = toOptionalCTAButton(
    ctaConfig.secondaryCta ?? DEFAULT_CTA_SECTION.secondaryCta
  );

  const showHero = !hasCustomSections || Boolean(heroSection);
  const showHowItWorks = !hasCustomSections || Boolean(howItWorksSection);
  const showServices = !hasCustomSections || Boolean(servicesSection);
  const showPackages = !hasCustomSections || Boolean(packagesSection);
  const showImpactStats = !hasCustomSections || Boolean(impactSection);
  const showTestimonials = !hasCustomSections || Boolean(testimonialsSection);
  const showBlog = !hasCustomSections || Boolean(blogSection);
  const showCTA = !hasCustomSections || Boolean(ctaSection);

  const sectionsByType: Record<
    HomePageSection['type'],
    React.ReactNode | null
  > = {
    hero: showHero ? (
      <HeroSectionComponent
        config={{
          ...heroConfig,
          backgroundVideoUrl:
            heroConfig.backgroundVideoUrl ?? DEFAULT_HERO.backgroundVideoUrl,
        }}
        impactStats={impactStats}
        providerSummaries={
          reviewAggregate.data?.providerSummaries ?? []
        }
        isReviewAggregateLoading={reviewAggregate.loading}
        isSiteSettingsLoading={siteSettings.loading}
      />
    ) : null,
    how_it_works: showHowItWorks ? (
      <HowItWorksSectionComponent
        config={{
          title: howItWorksConfig.title ?? DEFAULT_HOW_IT_WORKS.title!,
          subtitle: howItWorksConfig.subtitle,
          steps: howItWorksConfig.steps,
        }}
      />
    ) : null,
    services_highlight: showServices ? (
      <ServicesSection
        config={{
          title:
            servicesConfig.title ?? DEFAULT_SERVICES_SECTION.title ?? 'Our Specialist Services',
          subtitle: servicesConfig.subtitle,
          viewAllLabel:
            servicesConfig.viewAllLabel ??
            DEFAULT_SERVICES_SECTION.viewAllLabel ??
            'View All Services',
          viewAllHref:
            servicesConfig.viewAllHref ??
            DEFAULT_SERVICES_SECTION.viewAllHref ??
            ROUTES.SERVICES,
        }}
        services={highlightedServices}
        isLoading={showServicesSkeleton}
        error={servicesData.error}
      />
    ) : null,
    packages_highlight: showPackages ? (
      <PackagesSection
        config={{
          title: packagesConfig.title ?? DEFAULT_PACKAGES_SECTION.title!,
          subtitle: packagesConfig.subtitle,
          viewAllLabel:
            packagesConfig.viewAllLabel ?? DEFAULT_PACKAGES_SECTION.viewAllLabel!,
          viewAllHref:
            packagesConfig.viewAllHref ?? DEFAULT_PACKAGES_SECTION.viewAllHref!,
        }}
        packages={packagesToRender}
        allPackages={effectivePackages}
        isLoading={
          packagesData.loading && effectivePackages.length === 0
        }
        error={packagesData.error}
      />
    ) : null,
    impact_stats: showImpactStats ? (
      <ImpactStatsSectionComponent
        config={{
          title: impactConfig.title ?? DEFAULT_IMPACT_SECTION.title!,
          subtitle: impactConfig.subtitle,
        }}
        stats={impactStats}
      />
    ) : null,
    testimonials: showTestimonials ? (
      <TestimonialsSection
        config={{
          title:
            testimonialsConfig.title ?? DEFAULT_TESTIMONIALS_SECTION.title!,
          subtitle: testimonialsConfig.subtitle,
          limit: testimonialsLimit,
        }}
        testimonials={testimonialsToRender}
        isLoading={testimonialsData.loading}
        error={testimonialsData.error}
      />
    ) : null,
    blog: showBlog ? (
      <BlogSection
        config={{
          title: blogConfig.title ?? DEFAULT_BLOG_SECTION.title!,
          subtitle: blogConfig.subtitle,
          limit: blogLimit,
        }}
        posts={blogPostsData.posts.slice(0, blogLimit)}
        isLoading={blogPostsData.loading}
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

  return { sectionOrder, sectionsByType };
}
