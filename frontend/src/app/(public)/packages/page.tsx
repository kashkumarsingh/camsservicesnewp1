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
import { headers } from 'next/headers';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const imageUrl = '/og-images/og-image.jpg';

  return {
    title: 'Flexible & Affordable Packages - CAMS Services',
    description: 'Find the perfect plan to support your child\'s journey with our tailored SEN and trauma-informed care packages.',
    openGraph: {
      title: 'Flexible & Affordable Packages - CAMS Services',
      description: 'Find the perfect plan to support your child\'s journey with our tailored SEN and trauma-informed care packages.',
      url: `${baseUrl}/packages`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: 'CAMS Services Packages',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Flexible & Affordable Packages - CAMS Services',
      description: 'Find the perfect plan to support your child\'s journey with our tailored SEN and trauma-informed care packages.',
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/packages`,
    },
  };
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
          name: 'CAMS Services Packages',
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
      <Section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden bg-gradient-to-br from-[#0080FF] to-[#1E3A5F]">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/svgs/orbit-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold mb-4 leading-tight">
            Choose Your Package
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Tailored SEN & trauma-informed care programs for your child
          </p>
          <Button href="#packages" variant="yellow" size="lg" className="shadow-xl" withArrow>
            View Packages
          </Button>
        </div>
      </Section>


      {/* Packages Grid - Clean & Simple */}
      <Section id="packages" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-[#1E3A5F] mb-3">
              Available Packages
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Choose the package that best fits your child&apos;s needs
            </p>
          </div>

          {/* All Packages Grid */}
          <PackageList />

          {/* Help Section - Compact */}
          <div className="mt-16 bg-blue-50 rounded-xl border border-blue-200 p-6 text-center">
            <p className="text-gray-700 mb-4">
              Need help choosing? <span className="font-semibold text-[#0080FF]">Book a free consultation</span> or{' '}
              <a href={`tel:${phoneNumber}`} className="font-semibold text-[#0080FF] hover:underline">
                call us
              </a>
            </p>
            <Button href="/contact" variant="primary" size="sm" withArrow>
              Get Help Choosing
            </Button>
          </div>
        </div>
      </Section>

      {/* Package Comparison - Simplified */}
      <Section id="compare" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#1E3A5F] mb-2">
              Compare Packages
            </h2>
            <p className="text-gray-600">
              See all features side-by-side
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 overflow-x-auto">
            <PackageComparisonTable />
          </div>
        </div>
      </Section>

      {/* FAQ Section - Compact */}
      <Section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-[#1E3A5F] mb-2">
              Frequently Asked Questions
            </h2>
          </div>
          <FAQList filterOptions={{ category: 'packages' }} />
        </div>
      </Section>
    </div>
  );
}
