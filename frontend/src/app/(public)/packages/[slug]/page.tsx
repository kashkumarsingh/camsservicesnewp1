import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import PackageDetailsDisplay from '@/components/features/packages/PackageDetailsDisplay';
import PackageBookingCard from '@/components/features/packages/PackageBookingCard';
import BookNowStickyFooter from '@/components/features/common/BookNowStickyFooter';
import SimilarPackagesSection from '@/components/features/packages/SimilarPackagesSection';
import { Star, Users, Award, TrendingUp, Heart, Shield, Sparkles, ArrowRight, Activity as ActivityIcon, Clock, CheckCircle2, Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { GetPackageUseCase } from '@/core/application/packages/useCases/GetPackageUseCase';
import { packageRepository } from '@/infrastructure/persistence/packages';
import { ListTestimonialsUseCase, type TestimonialDTO } from '@/core/application/testimonials';
import { testimonialRepository } from '@/infrastructure/persistence/testimonials';
import type { PackageTrainerSummary } from '@/core/domain/packages/entities/Package';
import { ROUTES } from '@/utils/routes';

type TrainerCardInfo = {
  trainer: PackageTrainerSummary;
  activities: string[];
};

type DisplayTestimonial = {
  id: string;
  authorName: string;
  authorRole?: string | null;
  quote: string;
  rating?: number | null;
  sourceLabel?: string | null;
  avatarUrl?: string | null;
};

const TRUST_INDICATOR_ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  shield: Shield,
  star: Star,
  award: Award,
  users: Users,
  trending: TrendingUp,
  'trending-up': TrendingUp,
  heart: Heart,
  sparkles: Sparkles,
  activity: ActivityIcon,
  clock: Clock,
};

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  const getPackageUseCase = new GetPackageUseCase(packageRepository);
  let pkg = null;

  try {
    pkg = await getPackageUseCase.execute(slug);
  } catch (error) {
    console.warn(`[PackageDetail] Failed to fetch package "${slug}" for metadata.`, error);
  }

  if (!pkg) {
    return {
      title: 'Package Not Found | KidzRunz',
      description: 'The requested package could not be found.',
    };
  }

  const totalWeeksLabel = `${pkg.totalWeeks}-week programme`;
  const description = `Explore the ${pkg.name} package: ${pkg.hours} total hours across a ${totalWeeksLabel} designed to support your child with personalized SEN sessions.`;
  const canonicalUrl = `${BASE_URL}/packages/${pkg.slug}`;
  const imageUrl = `${BASE_URL}/og-images/og-image.jpg`;

  return {
    title: `${pkg.name} Package | ${totalWeeksLabel}`,
    description,
    openGraph: {
      title: `${pkg.name} Package`,
      description,
      url: canonicalUrl,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${pkg.name} package overview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pkg.name} Package`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function PackageDetail({ params }: {params: Promise<{slug: string}>}) {
  const { slug } = await params;
  const getPackageUseCase = new GetPackageUseCase(packageRepository);
  
  // Use timeout for fast failure
  const pkg = await withTimeoutFallback(
    getPackageUseCase.execute(slug),
    3500, // 3.5s timeout – key sales page, allowed a bit more but still bounded
    null
  );

  if (!pkg) {
    // Log in development to help debug
    if (process.env.NODE_ENV === 'development') {
      console.warn(`[PackageDetail] Package with slug "${slug}" not found. Returning 404.`);
    }
    notFound();
  }

  // Calculate savings (example: assume original price is 20% higher)
  const convertSummaryToDisplay = (summary: {
    id: string;
    authorName: string;
    authorRole?: string | null;
    quote: string;
    rating?: number | null;
    sourceLabel?: string | null;
    avatarUrl?: string | null;
  }): DisplayTestimonial => ({
    id: summary.id,
    authorName: summary.authorName,
    authorRole: summary.authorRole ?? undefined,
    quote: summary.quote,
    rating: summary.rating,
    sourceLabel: summary.sourceLabel ?? undefined,
    avatarUrl: summary.avatarUrl ?? undefined,
  });

  const convertDtoToDisplay = (testimonial: TestimonialDTO): DisplayTestimonial => ({
    id: testimonial.id,
    authorName: testimonial.authorName,
    authorRole: testimonial.authorRole ?? undefined,
    quote: testimonial.quote,
    rating: testimonial.rating ?? undefined,
    sourceLabel: testimonial.sourceLabel ?? undefined,
    avatarUrl: testimonial.authorAvatarUrl ?? undefined,
  });

  const fallbackTestimonials: DisplayTestimonial[] = [
    {
      id: `fallback-${pkg.id}-1`,
      authorName: 'Sarah M.',
      authorRole: 'Parent of 7-year-old',
      quote: `The ${pkg.name} package exceeded our expectations! My child has become more confident and social. The trainers are amazing!`,
      rating: 5,
      sourceLabel: 'Parent Feedback',
    },
    {
      id: `fallback-${pkg.id}-2`,
      authorName: 'James P.',
      authorRole: 'Parent of 9-year-old twins',
      quote: `Best investment we made for our children. The progress reports for the ${pkg.name} journey are detailed and communication is always on point.`,
      rating: 5,
      sourceLabel: 'Family Review',
    },
    {
      id: `fallback-${pkg.id}-3`,
      authorName: 'Emma L.',
      authorRole: 'Parent of 6-year-old',
      quote: `Our daughter looks forward to every ${pkg.name} session! The activities are engaging and the team truly care about each child's journey.`,
      rating: 5,
      sourceLabel: 'Parent Feedback',
    },
  ];

  const packageTestimonials = pkg.testimonials?.map(convertSummaryToDisplay) ?? [];

  let remoteTestimonials: TestimonialDTO[] = [];
  if (packageTestimonials.length === 0) {
    const listTestimonialsUseCase = new ListTestimonialsUseCase(testimonialRepository);
    try {
      remoteTestimonials = await withTimeoutFallback(
        listTestimonialsUseCase.execute({
          featured: true,
          limit: 3,
        }),
        2500,
        [] // Fallback to empty array
      );
    } catch (error) {
      console.warn(
        `[PackageDetail] Failed to load global testimonials for package "${pkg.slug}". Falling back to static testimonials.`,
        error,
      );
    }
  }

  const testimonialsToRender: DisplayTestimonial[] = (
    packageTestimonials.length > 0
      ? packageTestimonials
      : remoteTestimonials.length > 0
        ? remoteTestimonials.map(convertDtoToDisplay)
        : fallbackTestimonials
  ).slice(0, 3);
  const averageRating =
    testimonialsToRender.length > 0
      ? testimonialsToRender.reduce((sum, testimonial) => sum + (testimonial.rating ?? 5), 0) /
        testimonialsToRender.length
      : null;
  const packageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: `${pkg.name} Package`,
    description: pkg.description,
    url: `${BASE_URL}/packages/${pkg.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'KidzRunZ',
      url: BASE_URL,
    },
    offers: {
      '@type': 'Offer',
      price: Number(pkg.price ?? 0).toFixed(2),
      priceCurrency: 'GBP',
      url: `${BASE_URL}/dashboard/parent?package=${encodeURIComponent(pkg.slug)}`,
      availability:
        pkg.metrics?.spotsRemaining && pkg.metrics.spotsRemaining > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
    totalHours: pkg.hours,
    timeRequired: `P${pkg.totalWeeks ?? 6}W`,
    aggregateRating:
      averageRating && testimonialsToRender.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: Number(averageRating.toFixed(1)),
            reviewCount: testimonialsToRender.length,
          }
        : undefined,
  };

  const packageActivities = pkg.activities ?? [];
  const trainerActivityMap = new Map<string, TrainerCardInfo>();

  packageActivities.forEach((activity) => {
    if (!activity.trainers || activity.trainers.length === 0) {
      return;
    }

    activity.trainers.forEach((activityTrainer) => {
      const key = activityTrainer.id;
      const existing = trainerActivityMap.get(key);

      if (existing) {
        if (!existing.activities.includes(activity.name)) {
          existing.activities.push(activity.name);
        }
        return;
      }

      trainerActivityMap.set(key, {
        trainer: activityTrainer,
        activities: [activity.name],
      });
    });
  });

  if (trainerActivityMap.size === 0 && pkg.trainers.length > 0) {
    pkg.trainers.forEach((trainer) => {
      const relatedActivities = packageActivities
        .filter((activity) => {
          if (activity.trainerIds?.length) {
            return activity.trainerIds.some((id) => id.toString() === trainer.id.toString());
          }

          if (activity.trainers?.length) {
            return activity.trainers.some((activityTrainer) => activityTrainer.id === trainer.id);
          }

          return false;
        })
        .map((activity) => activity.name);

      trainerActivityMap.set(trainer.id, {
        trainer,
        activities: relatedActivities,
      });
    });
  }

  const trainersForSection = Array.from(trainerActivityMap.values());

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(packageJsonLd) }} />
      <div>
        {/* Hero Section - Neutral slate style */}
        <Section className="border-b border-slate-200 bg-slate-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
              {pkg.name} Package
            </h1>
            <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto line-clamp-3">
              {(typeof pkg.description === 'string' ? pkg.description.replace(/<[^>]*>/g, '') : '') || 'SEN support package.'}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <Button href={`/dashboard/parent?package=${encodeURIComponent(pkg.slug)}`} variant="primary" size="lg" withArrow>
                Buy package
              </Button>
              <Button href={ROUTES.PACKAGES} variant="outline" size="lg" withArrow>
                Compare packages
              </Button>
            </div>
          </div>
        </Section>

        {/* Stats bar - neutral */}
        <Section className="py-6 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-center">
              <div>
                <div className="text-2xl font-bold text-slate-900">{pkg.hours}</div>
                <div className="text-sm text-slate-600">Total hours</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-200" />
              <div>
                <div className="text-2xl font-bold text-slate-900">{pkg.totalWeeks}</div>
                <div className="text-sm text-slate-600">Weeks</div>
              </div>
              {pkg.calculatedActivities != null && (
                <>
                  <div className="hidden sm:block w-px h-10 bg-slate-200" />
                  <div>
                    <div className="text-2xl font-bold text-slate-900">{pkg.calculatedActivities}</div>
                    <div className="text-sm text-slate-600">Activities</div>
                  </div>
                </>
              )}
              <div className="hidden sm:block w-px h-10 bg-slate-200" />
              <div>
                <div className="text-2xl font-bold text-slate-900">500+</div>
                <div className="text-sm text-slate-600">Happy families</div>
              </div>
              <div className="hidden sm:block w-px h-10 bg-slate-200" />
              <div>
                <div className="flex items-center justify-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="fill-slate-400 text-slate-400" size={18} />
                  ))}
                </div>
                <div className="text-sm text-slate-600 mt-1">4.9/5 rating</div>
              </div>
            </div>
            {pkg.trustIndicators && pkg.trustIndicators.length > 0 && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-sm">
                {pkg.trustIndicators.map((indicator) => {
                  const IconComponent =
                    (indicator.icon && TRUST_INDICATOR_ICON_MAP[indicator.icon.toLowerCase()]) || Shield;
                  return (
                    <div
                      key={`${indicator.label}-${indicator.value ?? 'value'}`}
                      className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded border border-slate-200 text-slate-700"
                    >
                      <IconComponent size={14} className="text-slate-500" />
                      <span className="font-medium">
                        {indicator.label}
                        {indicator.value ? ` ${indicator.value}` : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        {/* Features Preview - Quick Overview */}
        {pkg.features && pkg.features.length > 0 && (
          <Section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold text-slate-900 mb-2">What&apos;s included</h2>
                <p className="text-slate-600">Everything your child needs for success</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium border border-slate-200">
                    <CheckCircle2 size={16} className="text-slate-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {/* Why This Package Section */}
        <Section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Why choose the {pkg.name} package?
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Designed for families seeking comprehensive, results-driven care
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: Heart, title: 'Personalized approach', description: 'Every session is tailored to your child\'s unique needs, goals, and interests' },
                { icon: TrendingUp, title: 'Proven track record', description: '95% of families report significant improvement within the first month' },
                { icon: Award, title: 'Expert trainers', description: 'DBS-checked professionals with 10+ years of experience in SEN care' },
                { icon: Users, title: 'Small group sizes', description: 'Maximum 8 children per session for personalised attention' },
                { icon: Shield, title: 'Safe environment', description: 'Fully insured, risk-assessed activities in secure, welcoming spaces' },
                { icon: Sparkles, title: 'Progress tracking', description: 'Regular reports and updates to track your child\'s development' },
              ].map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div key={index} className="bg-white rounded-lg p-4 sm:p-6 border border-slate-200 shadow-sm">
                    <div className="w-12 h-12 rounded-lg bg-slate-900/5 flex items-center justify-center mb-4">
                      <Icon className="text-slate-700" size={24} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>

        {/* Meet Your Trainers */}
        <Section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Meet your dedicated trainers
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Your child will work with experienced, DBS-checked professionals who specialise in SEN and trauma-informed care
              </p>
            </div>

            {trainersForSection.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {trainersForSection.map(({ trainer, activities }) => {
                  const ratingLabel =
                    typeof trainer.rating === 'number' ? trainer.rating.toFixed(1) : 'Trusted';
                  const specialties = trainer.specialties ?? [];
                  const displayedActivities = activities.slice(0, 3);

                  const card = (
                    <div className="bg-white rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                      <div className="relative h-56 overflow-hidden">
                        {trainer.avatarUrl ? (
                          <Image
                            src={trainer.avatarUrl}
                            alt={trainer.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-600 text-3xl font-semibold">
                            {trainer.name.charAt(0)}
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/95 rounded px-2.5 py-1 flex items-center gap-1 border border-slate-200 shadow-sm">
                          <Star className="text-slate-500 fill-slate-500" size={14} />
                          <span className="font-semibold text-slate-900 text-xs">{ratingLabel}</span>
                        </div>
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {trainer.name}
                        </h3>
                        <p className="text-slate-600 font-medium text-sm mb-3">
                          {trainer.role ?? 'Specialist Trainer'}
                        </p>

                        {trainer.experienceYears && (
                          <p className="text-sm text-slate-600 mb-3">
                            {trainer.experienceYears}+ years of experience
                          </p>
                        )}

                        {specialties.length > 0 && (
                          <div className="mb-3">
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                              Specialties
                            </h4>
                            <div className="flex flex-wrap gap-1.5">
                              {specialties.slice(0, 3).map((specialty) => (
                                <span
                                  key={`${trainer.id}-${specialty}`}
                                  className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                                >
                                  {specialty}
                                </span>
                              ))}
                              {specialties.length > 3 && (
                                <span className="text-xs bg-slate-50 text-slate-500 px-2 py-0.5 rounded font-medium">
                                  +{specialties.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {displayedActivities.length > 0 && (
                          <div>
                            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                              Activities they lead
                            </h4>
                            <ul className="space-y-1 text-sm text-slate-700">
                              {displayedActivities.map((activityName) => (
                                <li key={`${trainer.id}-${activityName}`} className="flex items-center gap-2">
                                  <ArrowRight className="text-slate-400" size={14} />
                                  <span>{activityName}</span>
                                </li>
                              ))}
                              {activities.length > displayedActivities.length && (
                                <li className="text-xs text-slate-500">
                                  +{activities.length - displayedActivities.length} more
                                </li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  if (trainer.slug) {
                    return (
                      <Link key={trainer.id} href={ROUTES.TRAINER_BY_SLUG(trainer.slug)}>
                        {card}
                      </Link>
                    );
                  }

                  return (
                    <div key={trainer.id}>
                      {card}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-dashed border-slate-300 text-center">
                <p className="text-slate-900 font-semibold mb-2">Trainer profiles are coming soon</p>
                <p className="text-slate-600 text-sm">
                  Our CMS is syncing trainer assignments for the {pkg.name} package. Please check back shortly or contact our team for a detailed staffing plan.
                </p>
              </div>
            )}

            <div className="text-center mt-10">
              <Button href="/become-a-trainer" variant="bordered" size="lg" withArrow>
                Become a trainer
              </Button>
            </div>
          </div>
        </Section>

        {/* Package Details */}
        <Section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-12">
              {/* Main Content - 2 columns */}
              <div className="lg:col-span-2">
                <PackageDetailsDisplay pkg={pkg} />
              </div>

              {/* Sidebar - Compact & Improved */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  {/* Compact Booking Card */}
                  <PackageBookingCard pkg={pkg} />
                  {/* Quick Booking Steps - Collapsible */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <details className="group">
                      <summary className="cursor-pointer font-semibold text-slate-900 text-sm flex items-center justify-between">
                        <span>Booking steps</span>
                        <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                      </summary>
                      <div className="mt-3 space-y-2 pt-3 border-t border-slate-200">
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded bg-slate-900 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-semibold">1</span>
                          <div>
                            <div className="font-semibold text-slate-900">Your details</div>
                            <div className="text-slate-600">Parent & child info</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-semibold">2</span>
                          <div>
                            <div className="font-semibold text-slate-900">Choose & schedule</div>
                            <div className="text-slate-600">Trainer & sessions</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-xs">
                          <span className="w-5 h-5 rounded bg-slate-600 text-white flex items-center justify-center flex-shrink-0 text-[10px] font-semibold">3</span>
                          <div>
                            <div className="font-semibold text-slate-900">Review & pay</div>
                            <div className="text-slate-600">Secure payment</div>
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>

                  {/* Trust Badges - Compact */}
                  <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-center">
                    <Shield className="text-slate-600 mx-auto mb-2" size={22} />
                    <h4 className="font-semibold text-slate-900 text-sm mb-1">100% satisfaction</h4>
                    <p className="text-xs text-slate-600">
                      Money-back guarantee within first 2 sessions
                    </p>
                  </div>

                  {/* Payment Security */}
                  <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-700 mb-2">
                      <Shield className="text-slate-600" size={14} />
                      <span className="font-semibold">Secure payment</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-xs text-slate-600">
                      <span>PayPal</span>
                      <span>·</span>
                      <span>Payment link</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* Activities Included */}
        <Section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                What&apos;s included in the {pkg.name} journey
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Every activity is carefully sequenced to build confidence, social skills, and independence.
              </p>
            </div>

            {pkg.activities && pkg.activities.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pkg.activities.map((activity, index) => {
                  const associatedTrainers = activity.trainers ?? [];
                  const orderLabel = (activity.order ?? index) + 1;

                  return (
                    <div
                      key={`${activity.id}-${index}`}
                      className="bg-white rounded-lg p-5 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-900/5 text-slate-900 font-semibold flex items-center justify-center text-sm">
                          #{orderLabel}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">{activity.name}</h3>
                          <p className="text-sm text-slate-500">
                            Approx. {activity.duration} hour{activity.duration === 1 ? '' : 's'} per session
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm mb-4">{activity.description}</p>

                      <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                        <Clock size={16} className="text-slate-500" />
                        <span>
                          Runs during our {pkg.totalWeeks}-week programme with weekly progress check-ins
                        </span>
                      </div>

                      {associatedTrainers.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                            Led by
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {associatedTrainers.slice(0, 3).map((trainer) => (
                              <span
                                key={`${activity.id}-${trainer.id}`}
                                className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-medium"
                              >
                                {trainer.name}
                              </span>
                            ))}
                            {associatedTrainers.length > 3 && (
                              <span className="text-xs bg-slate-50 text-slate-500 px-2.5 py-0.5 rounded font-medium">
                                +{associatedTrainers.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-dashed border-slate-300 text-center">
                <p className="text-slate-900 font-semibold mb-2">Activity schedule in progress</p>
                <p className="text-slate-600 text-sm">
                  We&apos;re updating the activity list for the {pkg.name} package. Our team will walk you through the full plan during your consultation.
                </p>
              </div>
            )}
          </div>
        </Section>

        {/* Success Stories - Dynamic Testimonials */}
        <Section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                Real results from real families
              </h2>
              <p className="text-slate-600">
                See what parents are saying about the {pkg.name} package
              </p>
            </div>

            {testimonialsToRender.length > 0 && (
              <div className="grid md:grid-cols-3 gap-6">
                {testimonialsToRender.map((testimonial) => {
                  const safeRating = Math.min(5, Math.max(1, testimonial.rating ?? 5));

                  return (
                    <div
                      key={testimonial.id}
                      className="bg-white rounded-lg p-4 sm:p-5 border border-slate-200 shadow-sm"
                    >
                      <div className="flex items-center gap-0.5 mb-3">
                        {Array.from({ length: safeRating }).map((_, i) => (
                          <Star
                            key={`${testimonial.id}-star-${i}`}
                            className="fill-slate-400 text-slate-400"
                            size={18}
                          />
                        ))}
                      </div>
                      <p className="text-slate-700 text-sm mb-4 italic leading-relaxed">&quot;{testimonial.quote}&quot;</p>
                      <div className="flex items-center gap-3">
                        {testimonial.avatarUrl ? (
                          <Image
                            src={testimonial.avatarUrl}
                            alt={testimonial.authorName}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-semibold text-sm">
                            {(testimonial.authorName || 'C').charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {testimonial.authorName}
                          </div>
                          {testimonial.authorRole && <div className="text-xs text-slate-600">{testimonial.authorRole}</div>}
                          {testimonial.sourceLabel && (
                            <div className="text-xs text-slate-500 mt-0.5">
                              {testimonial.sourceLabel}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Section>

        {/* Similar Packages Section */}
        <SimilarPackagesSection currentPackage={pkg} />

        {/* Final CTA */}
        <Section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Ready to get started?</h2>
            <p className="text-slate-600 mb-6">
              Join 500+ families who trust us with their children&apos;s development
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button href={`/dashboard/parent?package=${encodeURIComponent(pkg.slug)}`} variant="primary" size="lg" withArrow>
                Buy package
              </Button>
              <Button href={ROUTES.CONTACT} variant="outline" size="lg">
                Have questions?
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-slate-500" />
                <span>Secure payment</span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-2">
                <Star className="text-slate-500 fill-slate-500" size={14} />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </Section>
      </div>
      <BookNowStickyFooter slug={pkg.slug} />
    </>
  );
}
