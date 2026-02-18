'use client';

import { Fragment, useMemo } from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { PackageCard } from '@/interfaces/web/components/packages';
import { BlogPostCard } from '@/interfaces/web/components/blog';
import { usePackages } from '@/interfaces/web/hooks/packages';
import { useBlogPosts } from '@/interfaces/web/hooks/blog';
import { useServices } from '@/interfaces/web/hooks/services';
import { testimonials as testimonialFallbackData } from '@/data/commonData';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { PackageSkeleton, BlogPostSkeleton, TestimonialSkeleton, ServiceSkeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import {
  Sparkles,
  CheckCircle2,
  Star,
  Award,
  Shield,
  Phone,
  Users,
  Calendar,
  Target,
  FileText,
  Clock,
  MessageCircle,
  Heart,
  Gift,
} from 'lucide-react';
import { useTestimonials } from '@/interfaces/web/hooks/testimonials';
import { useReviewAggregate } from '@/interfaces/web/hooks/reviews/useReviewAggregate';
import { useSiteSettings } from '@/interfaces/web/hooks/siteSettings';
import {
  type HomePageSection,
  type HeroSection,
  type HowItWorksSection,
  type ImpactStatsSection,
  type ServicesHighlightSection,
  type PackagesHighlightSection,
  type TestimonialsSection as HomeTestimonialsSection,
  type BlogSection as HomeBlogSection,
  type CTASection as HomeCTASection,
  type CTAConfig,
  isHeroSection,
  isHowItWorksSection,
  isImpactStatsSection,
  isServicesHighlightSection,
  isPackagesHighlightSection,
  isTestimonialsSection,
  isBlogSection,
  isCTASection,
} from '@/core/domain/pages/valueObjects/homePageSections';

const ICON_COMPONENT_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  users: Users,
  user: Users,
  clock: Clock,
  calendar: Calendar,
  star: Star,
  award: Award,
  shield: Shield,
  target: Target,
  heart: Heart,
  gift: Gift,
  phone: Phone,
  sparkles: Sparkles,
  check: CheckCircle2,
  'file-text': FileText,
  'message-circle': MessageCircle,
};

const DEFAULT_HERO: HeroSection['data'] = {
  badgeText: 'Trusted by 500+ Families Since 2014',
  heading: 'Transform Your Child\'s Future',
  subheading: 'Specialist SEN & trauma-informed care that empowers children to thrive',
  primaryCta: { label: 'Book FREE Consultation', href: '/contact', variant: 'primary' as const },
  secondaryCta: { label: 'See How It Works', href: '#how-it-works', variant: 'outline' as const },
  backgroundVideoUrl: '/videos/space-bg-2.mp4',
};

const DEFAULT_HOW_IT_WORKS: HowItWorksSection['data'] = {
  title: 'How It Works',
  subtitle: 'Getting started is simple. Just three easy steps to transform your child\'s journey.',
  steps: [
    { title: 'Book FREE Consultation', description: 'Share your child\'s needs, strengths, and goals. Get approved to start your journey.', icon: 'phone' },
    { title: 'Purchase Your Package', description: 'Choose the perfect package for your family. Pay once, then book sessions at your pace.', icon: 'calendar' },
    { title: 'Book Sessions & Thrive', description: 'Book sessions from your dashboard when ready. Watch your child progress with evidence-based support.', icon: 'sparkles' },
  ],
};

const DEFAULT_SERVICES_SECTION: ServicesHighlightSection['data'] = {
  title: 'Our Specialist Services',
  subtitle: 'Evidence-based support tailored to your child\'s unique needs',
  viewAllLabel: 'View All Services',
  viewAllHref: '/services',
};

const DEFAULT_PACKAGES_SECTION: PackagesHighlightSection['data'] = {
  title: 'Flexible Care Packages',
  subtitle: 'Choose the perfect package for your family. All include DBS-checked staff, personalized plans, and ongoing support.',
  viewAllLabel: 'Compare All Packages',
  viewAllHref: '/packages',
};

const DEFAULT_IMPACT_SECTION: ImpactStatsSection['data'] = {
  title: 'Our Impact',
  subtitle: 'Real results that make a difference in children\'s lives',
};

const DEFAULT_TESTIMONIALS_SECTION: HomeTestimonialsSection['data'] = {
  title: 'What Families Say',
  subtitle: 'Don\'t just take our word for it - hear from the families we\'ve helped',
  limit: 6,
};

const DEFAULT_BLOG_SECTION: HomeBlogSection['data'] = {
  title: 'Latest from Our Blog',
  subtitle: 'Expert insights, tips, and stories to support your parenting journey',
  limit: 3,
};

const DEFAULT_CTA_SECTION: HomeCTASection['data'] = {
  title: 'Ready to Transform Your Child\'s Future?',
  subtitle: 'Book your FREE consultation today and discover how we can help your child thrive',
  primaryCta: { label: 'Book FREE Consultation', href: '/contact' },
  secondaryCta: { label: 'View All Packages', href: '/packages' },
};

const DEFAULT_SECTION_SEQUENCE: HomePageSection['type'][] = [
  'hero',
  'how_it_works',
  'services_highlight',
  'packages_highlight',
  'impact_stats',
  'testimonials',
  'blog',
  'cta',
];

const toCTAButton = (cta: CTAConfig) => ({
  text: cta.label,
  href: cta.href,
});

const toOptionalCTAButton = (cta?: CTAConfig) => (cta ? toCTAButton(cta) : undefined);

import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { ServiceDTO } from '@/core/application/services';

type HomePageClientProps = {
  sections: HomePageSection[];
  packages: PackageDTO[];
  services: ServiceDTO[];
};

export default function HomePageClient({ sections, packages, services }: HomePageClientProps) {
  const hasCustomSections = sections.length > 0;

  const heroSection = sections.find(isHeroSection);
  const howItWorksSection = sections.find(isHowItWorksSection);
  const servicesSection = sections.find(isServicesHighlightSection);
  const packagesSection = sections.find(isPackagesHighlightSection);
  const impactSection = sections.find(isImpactStatsSection);
  const testimonialsSection = sections.find(isTestimonialsSection);
  const blogSection = sections.find(isBlogSection);
  const ctaSection = sections.find(isCTASection);

  const heroConfig = useMemo(() => {
    return { ...DEFAULT_HERO, ...(heroSection?.data ?? {}) };
  }, [heroSection]);

  const howItWorksConfig = useMemo(() => {
    return {
      ...DEFAULT_HOW_IT_WORKS,
      ...(howItWorksSection?.data ?? {}),
      steps: howItWorksSection?.data?.steps?.length ? howItWorksSection.data.steps : DEFAULT_HOW_IT_WORKS.steps,
    };
  }, [howItWorksSection]);

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

  const packagesConfig = useMemo(() => {
    return { ...DEFAULT_PACKAGES_SECTION, ...(packagesSection?.data ?? {}) };
  }, [packagesSection]);

  const impactConfig = useMemo(() => {
    return { ...DEFAULT_IMPACT_SECTION, ...(impactSection?.data ?? {}) };
  }, [impactSection]);

  const testimonialsConfig = useMemo(() => {
    return { ...DEFAULT_TESTIMONIALS_SECTION, ...(testimonialsSection?.data ?? {}) };
  }, [testimonialsSection]);

  const blogConfig = useMemo(() => {
    return { ...DEFAULT_BLOG_SECTION, ...(blogSection?.data ?? {}) };
  }, [blogSection]);

  const ctaConfig = useMemo(() => {
    return { ...DEFAULT_CTA_SECTION, ...(ctaSection?.data ?? {}) };
  }, [ctaSection]);

  const showHero = !hasCustomSections || Boolean(heroSection);
  const showHowItWorks = !hasCustomSections || Boolean(howItWorksSection);
  const showServices = !hasCustomSections || Boolean(servicesSection);
  const showPackages = !hasCustomSections || Boolean(packagesSection);
  const showImpactStats = !hasCustomSections || Boolean(impactSection);
  const showTestimonials = !hasCustomSections || Boolean(testimonialsSection);
  const showBlog = !hasCustomSections || Boolean(blogSection);
  const showCTA = !hasCustomSections || Boolean(ctaSection);

  const testimonialsLimit = testimonialsConfig.limit ?? 6;
  const blogLimit = blogConfig.limit ?? 3;

  const { packages: packagesData, loading: packagesLoading } = usePackages();
  const { posts: blogPostsData, loading: blogLoading } = useBlogPosts({ limit: blogLimit });
  const {
    services: servicesData,
    loading: servicesLoading,
    error: servicesError,
  } = useServices({ limit: 8 });
  const {
    testimonials: remoteTestimonials,
    loading: testimonialsLoading,
    error: testimonialsError,
  } = useTestimonials({ featured: true, limit: testimonialsLimit });
  const {
    data: reviewAggregate,
    loading: reviewAggregateLoading,
  } = useReviewAggregate(['google', 'trustpilot']);
  const { settings: siteSettings, loading: siteSettingsLoading } = useSiteSettings();

  const impactStats = useMemo(() => {
    if (impactSection?.data?.stats?.length) {
      return impactSection.data.stats;
    }
    const siteStats = siteSettings?.trustIndicators?.map((indicator) => ({
      label: indicator.label,
      value: indicator.value,
      icon: indicator.icon,
    }));
    return (
      siteStats?.slice(0, 4) ?? [
        { label: 'Families Supported', value: '500+', icon: 'users' },
        { label: 'DBS-Checked Professionals', value: '100%', icon: 'shield' },
        { label: 'Average Satisfaction', value: '98%', icon: 'star' },
        { label: 'Years of Expertise', value: '10+', icon: 'clock' },
      ]
    );
  }, [impactSection, siteSettings?.trustIndicators]);

  const fallbackTestimonials = testimonialFallbackData.map((testimonial, index) => ({
    id: `fallback-${index}`,
    publicId: `fallback-${index}`,
    slug: `fallback-${index}`,
    authorName: testimonial.name,
    authorRole: testimonial.role,
    authorAvatarUrl: testimonial.avatar,
    quote: testimonial.text,
    rating: testimonial.rating,
    sourceType: 'manual' as const,
    sourceLabel: 'CAMS Services',
    sourceUrl: undefined,
    locale: 'en-GB',
    isFeatured: true,
    badges: [],
  }));

  const testimonialsToRender = (remoteTestimonials.length > 0 ? remoteTestimonials : fallbackTestimonials).slice(
    0,
    testimonialsLimit,
  );

  const packagesToRender =
    packagesConfig.packageSlugs?.length && packagesData.length > 0
      ? packagesData.filter((pkg) => packagesConfig.packageSlugs?.includes(pkg.slug))
      : packagesData;

  const highlightedServices =
    servicesConfig.serviceSlugs?.length && servicesData.length > 0
      ? servicesData.filter((service) => servicesConfig.serviceSlugs?.includes(service.slug))
      : servicesData.slice(0, 4);

  const showServicesSkeleton = servicesLoading || (!!servicesError && highlightedServices.length === 0);

  const blogPostsToRender = blogPostsData.slice(0, blogLimit);

  const heroPrimaryCta = heroConfig.primaryCta ?? DEFAULT_HERO.primaryCta;
  const heroSecondaryCta = heroConfig.secondaryCta ?? DEFAULT_HERO.secondaryCta;
  const heroVideo = heroConfig.backgroundVideoUrl ?? DEFAULT_HERO.backgroundVideoUrl;
  const fallbackPrimaryCta =
    ctaConfig.primaryCta ?? DEFAULT_CTA_SECTION.primaryCta ?? { label: 'Book FREE Consultation', href: '/contact' };
  const normalizedPrimaryCta = toCTAButton(fallbackPrimaryCta);
  const normalizedSecondaryCta = toOptionalCTAButton(ctaConfig.secondaryCta ?? DEFAULT_CTA_SECTION.secondaryCta);
  const sectionOrder = hasCustomSections ? sections.map((section) => section.type) : DEFAULT_SECTION_SEQUENCE;

  const renderHeroSection = () => (
    <Section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-[#0080FF] to-[#1E3A5F]">
      <video className="absolute inset-0 w-full h-full object-cover z-0" src={heroVideo} loop autoPlay muted playsInline />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/50 to-[#1E3A5F]/70 z-10"></div>
      <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: 'repeat', backgroundSize: '40px 40px' }}></div>

      <div className="relative z-20 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            {heroConfig.badgeText && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-2.5 rounded-full mb-5 border border-white/30">
                <Sparkles className="text-[#FFD700]" size={16} />
                <span className="text-xs sm:text-sm font-bold">{heroConfig.badgeText}</span>
              </div>
            )}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-5 leading-tight tracking-tight heading-text-shadow">
              {heroConfig.heading}
            </h1>
            {heroConfig.subheading && (
              <p className="text-lg md:text-xl mb-8 opacity-95">{heroConfig.subheading}</p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              {heroPrimaryCta && (
                <Button href={heroPrimaryCta.href} variant={heroPrimaryCta.variant ?? 'yellow'} size="lg" withArrow>
                  {heroPrimaryCta.label}
                </Button>
              )}
              {heroSecondaryCta && (
                <Button href={heroSecondaryCta.href} variant={heroSecondaryCta.variant ?? 'outline'} size="lg" withArrow>
                  {heroSecondaryCta.label}
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 sm:gap-4">
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Shield className="text-[#7FFF00]" size={14} />
                <span className="text-xs sm:text-sm font-semibold">DBS Checked</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Star className="text-[#FFD700]" size={14} />
                <span className="text-xs sm:text-sm font-semibold">98% Satisfaction</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20">
                <Award className="text-[#00D4FF]" size={14} />
                <span className="text-xs sm:text-sm font-semibold">Award Winning</span>
              </div>
              {(reviewAggregate?.providerSummaries ?? []).map((summary) => (
                <div
                  key={summary.id}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20"
                >
                  <Star className="text-[#FFD700]" size={14} />
                  <span className="text-xs sm:text-sm font-semibold">
                    {summary.averageRating ? summary.averageRating.toFixed(1) : '4.9'}★ {summary.displayName}
                    {summary.reviewCount ? ` (${summary.reviewCount}+ reviews)` : ''}
                  </span>
                </div>
              ))}
              {reviewAggregateLoading && (
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20 animate-pulse">
                  <Star className="text-white opacity-70" size={14} />
                  <span className="text-xs sm:text-sm font-semibold text-white/70">Loading reviews…</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Trust Indicators & Quick CTA */}
          <div className="lg:max-w-md">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 sm:p-8 shadow-2xl">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full mb-4 border border-white/30">
                  <Sparkles className="text-[#FFD700]" size={16} />
                  <span className="text-sm font-bold text-white">Quick Start</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to Get Started?
                </h3>
                <p className="text-sm text-white/90 mb-6">
                  Get approved, purchase your package, then book sessions at your pace
                </p>
                <Button
                  href="/packages"
                  variant="yellow"
                  size="lg"
                  withArrow
                  className="w-full sm:w-auto mb-4"
                >
                  View All Packages
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3 text-white/90">
                  <Shield className="text-[#7FFF00]" size={18} />
                  <span className="text-sm font-semibold">DBS Checked Staff</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <CheckCircle2 className="text-[#FFD700]" size={18} />
                  <span className="text-sm font-semibold">98% Satisfaction Rate</span>
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <Award className="text-[#00D4FF]" size={18} />
                  <span className="text-sm font-semibold">Award Winning Service</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trust Indicators - Mobile Only */}
          <div className="lg:hidden mt-8 flex flex-wrap gap-2 sm:gap-4 justify-center">
            {siteSettingsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20 animate-pulse">
                  <div className="h-4 w-20 bg-white/20 rounded"></div>
                </div>
              ))
            ) : (
              impactStats.slice(0, 4).map((stat, index) => {
                const iconKey = stat.icon?.toLowerCase() ?? 'star';
                const Icon = ICON_COMPONENT_MAP[iconKey] || Star;
                const colors = ['text-[#00D4FF]', 'text-[#FFD700]', 'text-[#7FFF00]', 'text-[#FF69B4]'];
                const color = colors[index % colors.length];

                return (
                  <div
                    key={`${stat.label}-${index}`}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-full border border-white/20"
                  >
                    <Icon className={color} size={14} />
                    <span className="text-xs sm:text-sm font-semibold">
                      {stat.value} {stat.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Section>
  );

  const renderHowItWorksSection = () => (
    <Section id="how-it-works" className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">{howItWorksConfig.title}</h2>
          {howItWorksConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{howItWorksConfig.subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {howItWorksConfig.steps.map((step, index) => {
            const iconKey = step.icon?.toLowerCase() ?? 'sparkles';
            const Icon = ICON_COMPONENT_MAP[iconKey] || Sparkles;
            return (
              <div
                key={`${step.title}-${index}`}
                className="relative bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-2xl card-hover-lift transition-all duration-300 border-2 border-gray-200 md:hover:rotate-3 group"
              >
                <div className="relative h-48 bg-gradient-to-br from-[#0080FF] to-[#00D4FF] overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/80 to-[#00D4FF]/80 flex items-center justify-center">
                    <Icon className="text-white opacity-30" size={80} />
                  </div>
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-[#0080FF] font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-3 group-hover:text-[#0080FF] transition-colors duration-300">
                    {step.title}
                  </h3>
                  {step.description && <p className="text-gray-700 leading-relaxed">{step.description}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );

  const renderServicesSection = () => (
    <Section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
            {servicesConfig.title}
          </h2>
          {servicesConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{servicesConfig.subtitle}</p>
          )}
        </div>

        {showServicesSkeleton ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <ServiceSkeleton count={SKELETON_COUNTS.SERVICES} />
            {servicesError && (
              <div className="col-span-full text-center text-sm text-gray-500">
                {servicesError.message || 'Unable to load services right now. Please try again shortly.'}
              </div>
            )}
          </div>
        ) : highlightedServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {highlightedServices.map((service) => {
              const iconKey = service.icon?.toLowerCase() ?? 'heart';
              const Icon = ICON_COMPONENT_MAP[iconKey] || Heart;

              return (
                <div
                  key={service.slug}
                  className="group relative bg-white rounded-[30px] overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 card-hover-lift hover:rotate-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-[#0080FF] to-[#00D4FF] overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/70 to-[#00D4FF]/70 flex items-center justify-center">
                      <Icon className="text-white opacity-40" size={100} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                  </div>
                  <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#0080FF] to-[#00D4FF] rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-[#1E3A5F] group-hover:text-[#0080FF] transition-colors duration-300">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed mb-4">{service.description}</p>
                    <Button
                      href={`/services/${service.slug}`}
                      variant="bordered"
                      size="sm"
                      withArrow
                      className="group-hover:bg-[#0080FF] group-hover:text-white group-hover:border-[#0080FF]"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            <p>Services coming soon. Check back later!</p>
          </div>
        )}

        <div className="text-center">
          <Button href={servicesConfig.viewAllHref} variant="secondary" size="lg" withArrow>
            {servicesConfig.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );

  const renderPackagesSection = () => (
    <Section className="py-16 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <video className="w-full h-full object-cover" src="/videos/space-bg-2.mp4" loop autoPlay muted playsInline />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
            {packagesConfig.title}
          </h2>
          {packagesConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-8">{packagesConfig.subtitle}</p>
          )}
        </div>

        {packagesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-12">
            <PackageSkeleton count={SKELETON_COUNTS.PACKAGES} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 mb-12">
            {packagesToRender.map((pkg) => (
              <PackageCard key={pkg.id} package={pkg} allPackages={packagesData} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button href={packagesConfig.viewAllHref} variant="secondary" size="lg" withArrow>
            {packagesConfig.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );

  const renderImpactSection = () => (
    <Section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
            {impactConfig.title}
          </h2>
          {impactConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{impactConfig.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {impactStats.map((stat) => {
            const iconKey = stat.icon?.toLowerCase() ?? 'star';
            const Icon = ICON_COMPONENT_MAP[iconKey] || Star;
            return (
              <div
                key={stat.label}
                className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl sm:rounded-[30px] p-4 sm:p-6 md:p-8 text-center shadow-md hover:shadow-2xl card-hover-lift transition-all duration-300 border-2 border-gray-200 md:hover:rotate-3 group"
              >
                <Icon className="text-[#0080FF] mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300" size={32} />
                <div className="text-3xl sm:text-4xl font-bold text-[#1E3A5F] mb-2 group-hover:text-[#0080FF] transition-colors duration-300">
                  {stat.value}
                </div>
                <div className="text-gray-700 font-semibold text-sm sm:text-base">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );

  const renderTestimonialsSection = () => (
    <Section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
            {testimonialsConfig.title}
          </h2>
          {testimonialsConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{testimonialsConfig.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonialsLoading ? (
            <TestimonialSkeleton count={Math.min(testimonialsLimit, SKELETON_COUNTS.TESTIMONIALS)} />
          ) : (
            testimonialsToRender.map((testimonial) => {
              const ratingValue = Math.round(testimonial.rating ?? 5);
              const initials = testimonial.authorName.charAt(0).toUpperCase();

              return (
                <div
                  key={testimonial.id}
                  className="relative flex flex-col rounded-[30px] border-2 border-gray-200 shadow-md hover:shadow-2xl card-hover-lift transition-all duration-300 p-6 sm:p-8 bg-white h-full md:hover:rotate-3 group"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={i < ratingValue ? 'fill-[#FFD700] text-[#FFD700]' : 'text-gray-300'}
                        size={16}
                      />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 text-sm sm:text-base md:text-lg leading-relaxed italic flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center mt-4">
                    {testimonial.authorAvatarUrl ? (
                      <Image
                        src={testimonial.authorAvatarUrl}
                        alt={testimonial.authorName}
                        width={56}
                        height={56}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#0080FF] to-[#00D4FF] flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-[#1E3A5F] text-sm sm:text-base md:text-lg group-hover:text-[#0080FF] transition-colors duration-300">
                        {testimonial.authorName}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm md:text-base">
                        {testimonial.authorRole ?? 'CAMS Family'}
                      </div>
                      {testimonial.sourceLabel && (
                        <div className="text-xs text-gray-400 mt-1">{testimonial.sourceLabel}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {testimonialsError && (
          <p className="text-center text-sm text-red-600 mt-6">{testimonialsError.message}</p>
        )}
      </div>
    </Section>
  );

  const renderBlogSection = () => (
    <Section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
            {blogConfig.title}
          </h2>
          {blogConfig.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{blogConfig.subtitle}</p>
          )}
        </div>

        {blogLoading ? (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            <BlogPostSkeleton count={Math.min(blogLimit, SKELETON_COUNTS.BLOG_POSTS)} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10">
            {blogPostsToRender.map((post) => (
              <BlogPostCard key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button href="/blog" variant="secondary" size="lg" withArrow>
            Read More Articles
          </Button>
        </div>
      </div>
    </Section>
  );

  const renderCTASection = () => (
    <CTASection
      title={ctaConfig.title}
      subtitle={ctaConfig.subtitle ?? ''}
      primaryCTA={normalizedPrimaryCta}
      secondaryCTA={normalizedSecondaryCta}
      variant="default"
    />
  );

  const sectionsByType: Record<HomePageSection['type'], (() => React.ReactNode) | null> = {
    hero: showHero ? renderHeroSection : null,
    how_it_works: showHowItWorks ? renderHowItWorksSection : null,
    services_highlight: showServices ? renderServicesSection : null,
    packages_highlight: showPackages ? renderPackagesSection : null,
    impact_stats: showImpactStats ? renderImpactSection : null,
    testimonials: showTestimonials ? renderTestimonialsSection : null,
    blog: showBlog ? renderBlogSection : null,
    cta: showCTA ? renderCTASection : null,
  };

  return (
    <div>
      {sectionOrder.map((sectionType, index) => {
        const renderer = sectionsByType[sectionType];
        if (!renderer) {
          return null;
        }

        return (
          <Fragment key={`${sectionType}-${index}`}>
            {renderer()}
          </Fragment>
        );
      })}
    </div>
  );
}

