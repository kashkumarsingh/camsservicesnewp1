import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import CTASection from '@/components/shared/CTASection';
import { FAQItem } from '@/interfaces/web/components/faq';
import { GetFAQItemUseCase } from '@/core/application/faq/useCases/GetFAQItemUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';
import { ROUTES } from '@/utils/routes';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const useCase = new GetFAQItemUseCase(faqRepository);
  const faq = await useCase.execute(slug);
  
  if (!faq) {
    return {};
  }

  return {
    title: `${faq.title} - CAMS Services FAQ`,
    description: faq.content,
  };
}

import { withTimeoutFallback } from '@/utils/promiseUtils';

export default async function FAQDetailsPage({ params }: Props) {
  const { slug } = await params;
  const useCase = new GetFAQItemUseCase(faqRepository);
  const faq = await withTimeoutFallback(
    useCase.execute(slug),
    3000, // 3s timeout – individual FAQ detail should fail fast and 404 if backend is too slow
    null
  );

  if (!faq) {
    notFound();
  }

  return (
    <div>
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
            {faq.title}
          </h1>
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">
            <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Contact Us
            </Button>
            <Button href={ROUTES.FAQ} variant="outline" size="lg" className="shadow-lg" withArrow>
              View All FAQs
            </Button>
          </div>
        </div>
      </Section>

      {/* Content Section */}
      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <FAQItem slug={slug} incrementViews={true} />
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title="Still Have Questions?"
        subtitle="Our team is here to help! Contact us and we'll answer any questions you have."
        primaryCTA={{ text: "Contact Us Today", href: ROUTES.CONTACT }}
        secondaryCTA={{ text: "View Our Services", href: ROUTES.SERVICES }}
        variant="default"
      />
    </div>
  );
}
