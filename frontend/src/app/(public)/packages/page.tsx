import React from 'react';
import Section from '@/components/layout/Section';
import { PackageList } from '@/interfaces/web/components/packages';
import { FAQList } from '@/interfaces/web/components/faq';
import { ListPackagesWithMetricsUseCase } from '@/core/application/packages/useCases/ListPackagesWithMetricsUseCase';
import { PackageDTO } from '@/core/application/packages/dto/PackageDTO';
import { PackageListMetrics } from '@/core/application/packages/ports/IPackageRepository';
import { packageRepository } from '@/infrastructure/persistence/packages';
import Button from '@/components/ui/Button';
import PackageComparisonTable from '@/components/features/packages/PackageComparisonTable';
import { Metadata } from 'next';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { PACKAGES_PAGE } from '@/app/(public)/constants/packagesPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: PACKAGES_PAGE.META_TITLE,
      description: PACKAGES_PAGE.META_DESCRIPTION,
      path: ROUTES.PACKAGES,
      imageAlt: 'CAMS Services Packages',
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function PackagesPage() {
  // Use timeout utilities for fast failure - don't block page render
  const siteSettings = await withTimeoutFallback(getSiteSettings(), 3000, null);

  const listPackagesWithMetricsUseCase = new ListPackagesWithMetricsUseCase(packageRepository);
  let allPackages: PackageDTO[] = [];
  let packageMetrics: PackageListMetrics | undefined = undefined;
  let packagesFetchFailed = false;

  try {
    const result = await withTimeoutFallback(
      listPackagesWithMetricsUseCase.execute(),
      2500, // 2.5 second timeout – do not block page render if backend is slow
      { packages: [], metrics: undefined }
    );
    allPackages = result.packages;
    packageMetrics = result.metrics;
  } catch (error) {
    packagesFetchFailed = true;
    console.warn('[PackagesPage] Failed to fetch packages with metrics. Rendering fallbacks.', error);
  }

  const phoneNumber = siteSettings?.contact.phone || '+441234567890';
  const packageListJsonLd =
    allPackages.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: PACKAGES_PAGE.PACKAGES_JSON_LD_NAME,
          itemListElement: allPackages.map((pkg, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${BASE_URL}/packages/${pkg.slug}`,
            name: `${pkg.name} Package`,
            description: pkg.description,
          })),
        }
      : null;

  return (
    <div>
      {packageListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(packageListJsonLd) }} />
      )}
      {/* Hero Section - Simplified */}
      <Section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-primary-blue to-navy-blue">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/svgs/orbit-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-4 leading-tight">
            {PACKAGES_PAGE.HERO_TITLE}
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            {PACKAGES_PAGE.HERO_SUBTITLE}
          </p>
          <Button href="#packages" variant="yellow" size="lg" className="shadow-xl" withArrow>
            {PACKAGES_PAGE.HERO_CTA}
          </Button>
        </div>
      </Section>


      {/* Packages Grid - Clean & Simple */}
      <Section id="packages" className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">
              {PACKAGES_PAGE.SECTION_AVAILABLE_TITLE}
            </h2>
            <p className="text-lg text-navy-blue/80 max-w-2xl mx-auto">
              {PACKAGES_PAGE.SECTION_AVAILABLE_SUBTITLE}
            </p>
          </div>

          {/* All Packages Grid */}
          <PackageList />

          {/* Help Section - Compact */}
          <div className="mt-16 bg-primary-blue/10 rounded-card border-2 border-primary-blue/20 p-6 text-center">
            <p className="text-navy-blue/80 mb-4">
              {PACKAGES_PAGE.HELP_NEED} <span className="font-semibold text-primary-blue">{PACKAGES_PAGE.HELP_BOOK}</span> or{' '}
              <a href={`tel:${phoneNumber}`} className="font-semibold text-primary-blue hover:underline">
                {PACKAGES_PAGE.HELP_CALL}
              </a>
            </p>
            <Button href={ROUTES.CONTACT} variant="primary" size="sm" withArrow>
              {PACKAGES_PAGE.HELP_CTA}
            </Button>
          </div>
        </div>
      </Section>

      {/* Package Comparison - Simplified */}
      <Section id="compare" className="py-16 bg-gradient-to-br from-primary-blue/10 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-blue mb-2">
              {PACKAGES_PAGE.COMPARE_TITLE}
            </h2>
            <p className="text-navy-blue/80">
              {PACKAGES_PAGE.COMPARE_SUBTITLE}
            </p>
          </div>
          <div className="bg-white rounded-card shadow-card p-4 md:p-6 border-2 border-primary-blue/20 overflow-x-auto">
            <PackageComparisonTable />
          </div>
        </div>
      </Section>

      {/* FAQ Section - Compact */}
      <Section className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-navy-blue mb-2">
              {PACKAGES_PAGE.FAQ_TITLE}
            </h2>
          </div>
          <FAQList filterOptions={{ category: 'packages' }} />
        </div>
      </Section>
    </div>
  );
}
