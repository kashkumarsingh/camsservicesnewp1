import { notFound } from 'next/navigation';
import FAQAccordion from '@/components/features/faq/FAQAccordion';
import Section from '@/components/layout/Section';
import { bookingFAQs } from '@/data/bookingFAQData';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { CheckCircle2, Shield, Award, User, Users, Clock, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { formatCurrency, formatCurrencyWhole } from '@/utils/currencyFormatter';
import QuickSummaryCard from '@/components/features/packages/QuickSummaryCard';
import { GetPackageUseCase } from '@/core/application/packages/useCases/GetPackageUseCase';
import { packageRepository } from '@/infrastructure/persistence/packages';
import { PackageMapper } from '@/core/application/packages/mappers/PackageMapper';
import type { OriginalTrainer } from '@/components/features/booking/types';
import { ListTrainersUseCase, TrainerDTO } from '@/core/application/trainers';
import { createTrainerRepository } from '@/infrastructure/persistence/trainers';
import { ListActivitiesUseCase } from '@/core/application/activities';
import { createActivityRepository } from '@/infrastructure/persistence/activities';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  const getPackageUseCase = new GetPackageUseCase(packageRepository);
  const packageDTO = await getPackageUseCase.execute(slug);

  if (!packageDTO) {
    return {};
  }

  const pkg = PackageMapper.fromDTO(packageDTO);

  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const imageUrl = '/og-images/og-image.jpg';

  return {
    title: `Book ${pkg.name} Package - CAMS Services`,
    description: `Book your ${pkg.name} package with CAMS Services.`,
    openGraph: {
      title: `Book ${pkg.name} Package - CAMS Services`,
      description: `Book your ${pkg.name} package with CAMS Services.`,
      url: `${baseUrl}/book/${pkg.slug.value}`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: `${pkg.name} Package Booking`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `Book ${pkg.name} Package - CAMS Services`,
      description: `Book your ${pkg.name} package with CAMS Services.`,
      images: [`${baseUrl}${imageUrl}`],
    },
    alternates: {
      canonical: `${baseUrl}/book/${pkg.slug.value}`,
    },
  };
}

function mapTrainerToLegacy(trainer: TrainerDTO): OriginalTrainer {
  const numericId = Number(trainer.id);
  const fallbackImage = trainer.image?.src || '/images/team/placeholder-trainer.webp';

  return {
    id: Number.isFinite(numericId) ? numericId : Math.abs(trainer.slug.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)),
    slug: trainer.slug,
    imageSrc: fallbackImage,
    imageAlt: trainer.image?.alt || `${trainer.name} profile photo`,
    title: trainer.name,
    role: trainer.role || 'Specialist Coach',
    rating: typeof trainer.rating === 'number' ? trainer.rating : 5,
    certifications: trainer.certifications || [],
    fullDescription: trainer.description || trainer.summary,
    specialties: trainer.specialties || [],
    capabilities: trainer.capabilities || [],
    // Map location data from TrainerDTO (now properly typed)
    serviceRegions: trainer.serviceRegions || [],
  };
}

import { withTimeoutFallback } from '@/utils/promiseUtils';
import ConditionalPriceDisplay from '@/components/features/packages/ConditionalPriceDisplay';

export default async function BookPackagePage({ params }: Props) {
  // Note: Authentication check happens in BookingPageClient
  // We fetch package data here for SEO/metadata, but BookingPageClient
  // will redirect immediately if user is not authenticated
  const resolvedParams = await params;

  const getPackageUseCase = new GetPackageUseCase(packageRepository);
  const packageDTO = await withTimeoutFallback(
    getPackageUseCase.execute(resolvedParams.slug),
    3500, // 3.5s timeout – booking entrypoint, allow some time but avoid long hangs
    null
  );

  if (!packageDTO) {
    notFound();
  }

  const pkg = PackageMapper.fromDTO(packageDTO);

  let bookingTrainers: OriginalTrainer[] = [];
  try {
    // Fetch trainers directly from API to preserve location fields
    const { apiClient } = await import('@/infrastructure/http/ApiClient');
    const { API_ENDPOINTS } = await import('@/infrastructure/http/apiEndpoints');
    
    const response = await withTimeoutFallback(
      apiClient.get<{ 
        success: boolean;
        data: Array<{
          id: string;
          name: string;
          slug: string;
          role: string;
          summary: string;
          description?: string;
          rating: number;
          image: { src: string; alt: string };
          certifications: string[];
          specialties: string[];
          capabilities: string[];
          available: boolean;
          experience_years?: number;
          views: number;
          home_postcode?: string | null;
          travel_radius_km?: number | null;
          service_area_postcodes?: string[];
          service_regions?: string[];
          created_at: string;
          updated_at: string;
        }>;
      }>(`${API_ENDPOINTS.TRAINERS}?available=true&sort_by=rating&sort_order=desc`),
      3000, // 3s timeout – trainers list is important but shouldn't block the whole page
      { data: { success: true, data: [] } } // Fallback to empty trainers array
    );
    
    // Map API response directly to TrainerDTO with location fields
    const trainers: TrainerDTO[] = (response.data.data || []).map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      role: t.role,
      summary: t.summary,
      description: t.description,
      rating: t.rating,
      image: t.image,
      certifications: t.certifications,
      specialties: t.specialties,
      capabilities: t.capabilities,
      available: t.available,
      experienceYears: t.experience_years,
      views: t.views,
      homePostcode: t.home_postcode,
      travelRadiusKm: t.travel_radius_km,
      serviceAreaPostcodes: t.service_area_postcodes,
      serviceRegions: t.service_regions,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
    }));
    
    bookingTrainers = trainers.map(mapTrainerToLegacy);
  } catch (error) {
    console.error('Failed to load trainers for booking flow', error);
  }

  // Fetch activities from API endpoint
  let allActivities: Array<{ id: number; name: string; imageUrl: string; duration: number; description: string; available_in_regions?: string[] }> = [];
  try {
    const activityRepo = createActivityRepository('api');
    const listActivitiesUseCase = new ListActivitiesUseCase(activityRepo);
    const activities = await withTimeoutFallback(
      listActivitiesUseCase.execute({ published: true }),
      3000, // 3s timeout – activities enrich booking but are non-blocking
      [] // Fallback to empty array
    );
    // Convert domain activities to booking format
    allActivities = activities.map(activity => ({
      id: Number(activity.id),
      name: activity.name,
      imageUrl: activity.imageUrl || '',
      duration: activity.duration,
      description: activity.description,
      // Note: Backend should provide region/postcode availability if available
      // For now, activities from API are available everywhere (package activities)
      available_in_regions: undefined,
    }));
  } catch (error) {
    console.error('Failed to load activities for booking flow', error);
    // Fallback: use package activities only if API fails
    allActivities = pkg.activities.map(act => ({
      id: act.id,
      name: act.name,
      imageUrl: act.imageUrl,
      duration: act.duration,
      description: act.description,
      available_in_regions: undefined,
    }));
  }
  
  // Convert to legacy format for PackageBookingFlow component
  // TODO: Update PackageBookingFlow to use new booking domain
  const legacyPackage = {
    id: packageDTO.id ? Number(packageDTO.id) : 0, // Convert string ID to number for legacy compatibility (0 if invalid)
    slug: packageDTO.slug,
    name: pkg.name,
    description: pkg.description,
    price: pkg.price.amount,
    hours: pkg.hours.value,
    duration: `${pkg.duration.hoursPerWeek} hours per week for ${pkg.duration.totalWeeks} weeks`,
    features: pkg.features,
    spotsRemaining: pkg.spotsRemaining || 10,
    color: pkg.color,
    activities: pkg.activities.map(act => ({
      id: act.id,
      name: act.name,
      imageUrl: act.imageUrl,
      duration: act.duration,
      description: act.description,
      trainerIds: act.trainerIds ?? [],
    })),
    perks: pkg.perks,
    hoursPerWeek: pkg.duration.hoursPerWeek,
    totalWeeks: pkg.duration.totalWeeks, // Add totalWeeks for booking window constraint
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Hero Section - Compact (≈40% shorter) */}
      <Section className="relative pt-6 pb-4 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-primary-blue via-primary-blue/90 to-light-blue-cyan">
        <div className="relative z-10 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-white/90 text-sm">
            <span className="hover:text-white transition-colors cursor-pointer">Home</span>
            <span>/</span>
            <span className="hover:text-white transition-colors cursor-pointer">Packages</span>
            <span>/</span>
            <span className="text-white font-semibold">{pkg.name}</span>
          </div>

          {/* Hero Content (tighter grid + gaps) */}
          <div className="grid lg:grid-cols-3 gap-4 items-start">
            {/* Left: Package Details */}
            <div className="lg:col-span-2">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-4 shadow-lg">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                    {legacyPackage.name}
                  </h1>
                  <span className="inline-flex items-center gap-1.5 bg-amber-300/90 text-gray-900 px-2.5 py-1 rounded-full text-[11px] font-bold">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    Most popular
                  </span>
                </div>

                <p className="text-[15px] sm:text-base text-white/90 mb-3 leading-relaxed line-clamp-2">{legacyPackage.description}</p>

                {/* Inline Stats - tighter */}
                <div className="flex items-center gap-3 flex-wrap text-white/90">
                  <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Clock size={14} />{legacyPackage.hours}h
                  </span>
                  <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Users size={14} />{legacyPackage.spotsRemaining} spots
                  </span>
                  <span className="text-xs sm:text-sm font-semibold flex items-center gap-1.5">
                    <Award size={14} />4.9★
                  </span>
                  <span className="text-xs">•</span>
                  <span className="text-xs sm:text-sm font-medium">Instant</span>
                  <span className="text-xs sm:text-sm font-medium">Secure</span>
                  <span className="text-xs sm:text-sm font-medium">Guaranteed</span>
                </div>
              </div>
            </div>

            {/* Right: Booking Card - Proper Text Sizes */}
            <div className="lg:sticky lg:top-16">
              <div className="bg-white rounded-xl p-4 shadow-xl border-2 border-[#FFD700]">
                {/* Price row + scarcity */}
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <ConditionalPriceDisplay price={legacyPackage.price} />
                  </div>
                  <span className="text-[11px] font-bold text-red-700 bg-red-50 border border-red-200 rounded-full px-2.5 py-1 whitespace-nowrap">⚠️ {legacyPackage.spotsRemaining} left</span>
                </div>

                {/* Primary CTA - Navigate to checkout */}
                <a 
                  href={`/checkout?package=${legacyPackage.slug}`}
                  className="block w-full bg-gradient-to-r from-primary-blue to-light-blue-cyan text-white text-center py-3 px-5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all mb-3"
                >
                  Secure Your Spot Now
                </a>

                {/* Simple checkout info */}
                <div className="text-[11px] text-gray-600 text-center mb-3">
                  <span className="font-semibold text-gray-700">Quick checkout</span>
                  <span className="text-gray-500"> • </span>
                  <span>Book sessions after purchase</span>
                </div>

                {/* What's Included (inline chips) */}
                <div className="flex flex-wrap gap-2">
                  {legacyPackage.features.slice(0, 3).map((feature: string, index: number) => (
                    <span key={index} className="text-[11px] text-gray-700 bg-gray-50 border border-gray-200 rounded-full px-2 py-1 inline-flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-green-600" />{feature}
                    </span>
                  ))}
                  {legacyPackage.features.length > 3 && (
                    <span className="text-[11px] text-primary-blue font-semibold">+{legacyPackage.features.length - 3} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Package Details Section */}
      <Section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">

          {/* Package Features */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[#1E3A5F] mb-6 text-center">What&apos;s Included</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {legacyPackage.features.map((feature: string, index: number) => (
                <div key={index} className="bg-white rounded-lg p-4 border-2 border-gray-200 flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trust & Security Banner */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Why Parents Love Us</h3>
              <p className="text-gray-600 text-sm">Trusted by 200+ families across the UK</p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Shield className="text-white" size={32} />
                </div>
                <div className="font-bold text-gray-900 mb-1">Bank-Level Security</div>
                <div className="text-sm text-gray-600">256-bit SSL encryption protects your data</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <CheckCircle2 className="text-white" size={32} />
                </div>
                <div className="font-bold text-gray-900 mb-1">Instant Confirmation</div>
                <div className="text-sm text-gray-600">Receive booking details via email & SMS</div>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Award className="text-white" size={32} />
                </div>
                <div className="font-bold text-gray-900 mb-1">100% Satisfaction</div>
                <div className="text-sm text-gray-600">Money-back guarantee if not delighted</div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion - 2025 UX Component */}
          <div className="mt-12">
            <FAQAccordion
              faqs={bookingFAQs}
              title="Quick Questions?"
              description="Everything you need to know about booking with us"
              defaultOpenIndex={0}
            />
          </div>
        </div>
      </Section>
      </div>
  );
}
