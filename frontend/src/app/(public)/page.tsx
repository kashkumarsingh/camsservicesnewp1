import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import { SiteSetting } from '@/core/domain/siteSettings/entities/SiteSetting';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import type { HomePageSection } from '@/core/domain/pages/valueObjects/homePageSections';
import { ListPackagesUseCase } from '@/core/application/packages/useCases/ListPackagesUseCase';
import { ListServicesUseCase } from '@/core/application/services/useCases/ListServicesUseCase';
import { packageRepository } from '@/infrastructure/persistence/packages';
import { serviceRepository } from '@/infrastructure/persistence/services';
import { withTimeoutFallback } from '@/utils/promiseUtils';

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://camsservice.co.uk';

function buildLogoUrl(path?: string | null) {
  if (!path) {
    return `${DEFAULT_BASE_URL}/og-images/og-image.jpg`;
  }
  if (path.startsWith('http')) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${DEFAULT_BASE_URL}${path}`;
  }
  return `${DEFAULT_BASE_URL}/${path}`;
}

function buildHomeJsonLd(siteSettings: SiteSetting | null) {
  const orgName = siteSettings?.company.name ?? 'CAMS Services';
  const contact = siteSettings?.contact;
  const socialLinks = siteSettings?.social.links?.map((link) => link.url) ?? [];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: DEFAULT_BASE_URL,
      logo: buildLogoUrl(siteSettings?.navigation.logoPath ?? null),
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: contact?.phone ?? '+44 20 1234 5678',
          contactType: 'customer service',
          areaServed: 'GB',
          availableLanguage: 'en-GB',
        },
      ],
      sameAs: socialLinks,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: orgName,
      url: DEFAULT_BASE_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${DEFAULT_BASE_URL}/search?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const siteSettings = await withTimeoutFallback(getSiteSettings(), 2000, null).catch(() => null);
    const title = siteSettings?.company.name
      ? `${siteSettings.company.name} | Specialist SEN & Trauma-Informed Care`
      : 'KidzRunZ | Specialist SEN & Trauma-Informed Care';
    const description =
      siteSettings?.company.description ??
      'Specialist SEN & trauma-informed care programmes with DBS-checked professionals, personalized plans, and proven results.';

    return {
      title,
      description,
      alternates: {
        canonical: DEFAULT_BASE_URL,
      },
      openGraph: {
        title,
        description,
        url: DEFAULT_BASE_URL,
        siteName: siteSettings?.company.name ?? 'CAMS Services',
        images: [
          {
            url: `${DEFAULT_BASE_URL}/og-images/homepage.jpg`,
            width: 1200,
            height: 630,
            alt: 'CAMS Services - Specialist SEN & Trauma-Informed Care',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [`${DEFAULT_BASE_URL}/og-images/homepage.jpg`],
      },
    };
  } catch (error) {
    // Fallback metadata if site settings fail to load
    console.error('[generateMetadata] Error generating metadata:', error);
    return {
      title: 'CAMS Services | Specialist SEN & Trauma-Informed Care',
      description: 'Specialist SEN & trauma-informed care programmes with DBS-checked professionals, personalized plans, and proven results.',
      alternates: {
        canonical: DEFAULT_BASE_URL,
      },
      openGraph: {
        title: 'CAMS Services | Specialist SEN & Trauma-Informed Care',
        description: 'Specialist SEN & trauma-informed care programmes with DBS-checked professionals, personalized plans, and proven results.',
        url: DEFAULT_BASE_URL,
        siteName: 'CAMS Services',
        images: [
          {
            url: `${DEFAULT_BASE_URL}/og-images/homepage.jpg`,
            width: 1200,
            height: 630,
            alt: 'CAMS Services - Specialist SEN & Trauma-Informed Care',
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'CAMS Services | Specialist SEN & Trauma-Informed Care',
        description: 'Specialist SEN & trauma-informed care programmes with DBS-checked professionals, personalized plans, and proven results.',
        images: [`${DEFAULT_BASE_URL}/og-images/homepage.jpg`],
      },
    };
  }
}

async function fetchPackages() {
  const useCase = new ListPackagesUseCase(packageRepository);
  try {
    return await useCase.execute();
  } catch (error) {
    // Silently return empty array - timeout wrapper will handle logging
    // Only log non-timeout errors in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error && !error.message?.includes('timeout')) {
      console.warn('[HomePage] Failed to load packages:', error);
    }
    return [];
  }
}

async function fetchServices() {
  const useCase = new ListServicesUseCase(serviceRepository);
  try {
    return await useCase.execute();
  } catch (error) {
    // Silently return empty array - timeout wrapper will handle logging
    // Only log non-timeout errors in development
    if (process.env.NODE_ENV === 'development' && error instanceof Error && !error.message?.includes('timeout')) {
      console.warn('[HomePage] Failed to load services:', error);
    }
    return [];
  }
}

export default async function LandingPage() {
  // Initialize with empty fallbacks
  let siteSettings: SiteSetting | null = null;
  let homePage = null;
  let packages: any[] = [];
  let services: any[] = [];

  try {
    // Use centralized timeout utility for consistent, FAANG-grade timeout handling
    // Promise.allSettled ensures no single slow API blocks the entire page render
    // Each operation has independent timeout with graceful fallback
    const [siteSettingsResult, homePageResult, packagesResult, servicesResult] = await Promise.allSettled([
      withTimeoutFallback(getSiteSettings(), 3000, null).catch(() => null), // Site settings have internal 1.5s timeout, outer guard remains 3s
      withTimeoutFallback(
        new GetPageUseCase(pageRepository).execute('home').catch(() => null),
        3000,
        null
      ).catch(() => null), // 3 second timeout, fallback to null
      withTimeoutFallback(fetchPackages(), 2000, []).catch(() => []), // 2 second timeout, fail fast and show page without packages
      withTimeoutFallback(fetchServices(), 2000, []).catch(() => []), // 2 second timeout, fail fast and show page without services
    ]);

    // Extract values with fallbacks
    siteSettings = siteSettingsResult.status === 'fulfilled' ? siteSettingsResult.value : null;
    homePage = homePageResult.status === 'fulfilled' ? homePageResult.value : null;
    packages = packagesResult.status === 'fulfilled' ? packagesResult.value : [];
    services = servicesResult.status === 'fulfilled' ? servicesResult.value : [];
  } catch (error) {
    // Log error for debugging
    console.error('[LandingPage] Error rendering home page:', error);
    // Use fallback values (already initialized above)
  }

  const structuredData = buildHomeJsonLd(siteSettings);
  const sections = (homePage?.sections ?? []) as HomePageSection[];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HomePageClient sections={sections} packages={packages} services={services} />
    </>
  );
}

