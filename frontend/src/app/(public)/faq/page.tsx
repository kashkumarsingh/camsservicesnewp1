import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { FAQList } from '@/interfaces/web/components/faq';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { ListFAQItemsUseCase } from '@/core/application/faq/useCases/ListFAQItemsUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;
  const imageUrl = '/og-images/og-image.jpg'; // Assuming a default OG image for FAQ page

  return {
    title: 'Frequently Asked Questions - CAMS Services',
    description: 'Find answers to common questions about CAMS Services, our packages, and support.',
    openGraph: {
      title: 'Frequently Asked Questions - CAMS Services',
      description: 'Find answers to common questions about CAMS Services, our packages, and support.',
      url: `${baseUrl}/faq`,
      type: 'website',
      images: [
        {
          url: `${baseUrl}${imageUrl}`,
          width: 1200,
          height: 630,
          alt: 'CAMS Services FAQ',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Frequently Asked Questions - CAMS Services',
      description: 'Find answers to common questions about CAMS Services, our packages, and support.',
      images: [imageUrl],
    },
    alternates: {
      canonical: `${baseUrl}/faq`,
    },
  };
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/30 to-[#00D4FF]/20 z-10"></div>
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/question-pattern.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            Find answers to common questions about CAMS Services, our packages, and support.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href="/contact" variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Still Have Questions?
            </Button>
            <Button href="/services" variant="outline" size="lg" className="shadow-lg" withArrow>
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
        title="Didn't Find What You're Looking For?"
        subtitle="Our team is here to help! Contact us and we'll answer any questions you have."
        primaryCTA={{ text: "Contact Us Today", href: "/contact" }}
        secondaryCTA={{ text: "View Our Packages", href: "/packages" }}
        variant="default"
      />
    </div>
  );
}
