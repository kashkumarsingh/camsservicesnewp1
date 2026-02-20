import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { FAQList } from '@/interfaces/web/components/faq';
import { Metadata } from 'next';
import { ListFAQItemsUseCase } from '@/core/application/faq/useCases/ListFAQItemsUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { FAQ_PAGE } from '@/app/(public)/constants/faqPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: FAQ_PAGE.META_TITLE,
      description: FAQ_PAGE.META_DESCRIPTION,
      path: ROUTES.FAQ,
      imageAlt: 'CAMS Services FAQ',
    },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function FAQPage() {
  let faqStructuredData: Array<Record<string, unknown>> = [];
  try {
    const listFaqUseCase = new ListFAQItemsUseCase(faqRepository);
    const faqItems = await withTimeoutFallback(
      listFaqUseCase.execute({ limit: 8 }),
      2500, // 2.5s timeout – FAQ page should not wait longer than this
      [] // Fallback to empty array
    );
    faqStructuredData = faqItems
      .filter((faq) => faq.content?.trim())
      .map((faq) => ({
        '@type': 'Question',
        name: faq.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.content,
        },
      }));
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[FAQPage] Failed to build FAQ JSON-LD payload.', error);
    }
  }

  const faqJsonLd =
    faqStructuredData.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: faqStructuredData,
        }
      : null;

  return (
    <div>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      {/* Hero Section */}
      <Section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-screen flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.mp4"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-light-blue-cyan/20 z-10"></div>
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/question-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            Find answers to common questions about CAMS Services, our packages, and support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Still Have Questions?
            </Button>
            <Button href={ROUTES.SERVICES} variant="outline" size="lg" className="shadow-lg" withArrow>
              Explore Our Services
            </Button>
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="max-w-3xl mx-auto">
            <FAQList />
          </div>
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title={FAQ_PAGE.CTA_TITLE}
        subtitle={FAQ_PAGE.CTA_SUBTITLE}
        primaryCTA={{ text: FAQ_PAGE.CTA_PRIMARY, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: FAQ_PAGE.CTA_SECONDARY, href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}
