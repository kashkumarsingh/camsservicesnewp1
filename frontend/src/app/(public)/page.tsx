import type { Metadata } from 'next';
import { headers } from 'next/headers';
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
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/utils/seoConstants';

// Mark as dynamic because we use headers() in generateMetadata
export const dynamic = 'force-dynamic';

function getBaseUrl(): string {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) return siteUrl.replace(/\/$/, '');
  return 'https://camsservice.co.uk';
}

function buildLogoUrl(path: string | null | undefined, baseUrl: string) {
  if (!path) return `${baseUrl}/og-images/og-image.jpg`;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${baseUrl}${path}`;
  return `${baseUrl}/${path}`;
}

function buildHomeJsonLd(siteSettings: SiteSetting | null, baseUrl: string) {
  const orgName = siteSettings?.company.name ?? 'CAMS Services';
  const contact = siteSettings?.contact;
  const socialLinks = siteSettings?.social.links?.map((link) => link.url) ?? [];

  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: orgName,
      url: baseUrl,
      logo: buildLogoUrl(siteSettings?.navigation.logoPath ?? null, baseUrl),
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
      url: baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${baseUrl}/search?query={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ];
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}` || getBaseUrl();

  let title: string;
  let description: string;
  let siteName: string | null = null;

  try {
    const siteSettings = await withTimeoutFallback(getSiteSettings(), 5000, null).catch(() => null);
    siteName = siteSettings?.company.name ?? null;
    title = siteName
      ? `${siteName} | Specialist SEN & Trauma-Informed Care`
      : `${SEO_DEFAULTS.siteName} | Specialist SEN & Trauma-Informed Care`;
    description =
      siteSettings?.company.description?.trim() ??
      SEO_DEFAULTS.description;
  } catch {
    title = `${SEO_DEFAULTS.siteName} | Specialist SEN & Trauma-Informed Care`;
    description = SEO_DEFAULTS.description;
  }

  return buildPublicMetadata(
    {
      title,
      description,
      path: '/',
      imageUrl: '/og-images/homepage.jpg',
      imageAlt: siteName ? `${siteName} - Specialist SEN & Trauma-Informed Care` : SEO_DEFAULTS.ogImageAlt,
      siteName: siteName ?? undefined,
    },
    baseUrl
  );
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
    // Each operation has independent timeout with graceful fallback (generous for Docker/cold start)
    const [siteSettingsResult, homePageResult, packagesResult, servicesResult] = await Promise.allSettled([
      withTimeoutFallback(getSiteSettings(), 6000, null).catch(() => null), // 6s – site settings (internal 10s), outer guard for cold backend
      withTimeoutFallback(
        new GetPageUseCase(pageRepository).execute('home').catch(() => null),
        6000,
        null
      ).catch(() => null), // 6s – home page content
      withTimeoutFallback(fetchPackages(), 5000, []).catch(() => []), // 5s – fail fast and show page without packages if slow
      withTimeoutFallback(fetchServices(), 5000, []).catch(() => []), // 5s – fail fast and show page without services if slow
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

  const baseUrl = getBaseUrl();
  const structuredData = buildHomeJsonLd(siteSettings, baseUrl);
  const sections = (homePage?.sections ?? []) as HomePageSection[];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HomePageClient sections={sections} packages={packages} services={services} />
    </>
  );
}

