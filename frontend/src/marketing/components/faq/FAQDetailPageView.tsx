import type { ReactElement } from 'react';
import Section from '@/components/layout/Section';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import CTASection from '@/components/shared/CTASection';
import { FAQItem } from '@/interfaces/web/components/faq';
import type { FAQItemDTO } from '@/core/application/faq/dto/FAQItemDTO';

type FAQDetailPageViewProps = {
  faq: FAQItemDTO;
  slug: string;
  contactRoute: string;
  faqRoute: string;
  servicesRoute: string;
  copy: {
    ctaContact: string;
    ctaViewAll: string;
    ctaTitle: string;
    ctaSubtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export function FAQDetailPageView({
  faq,
  slug,
  contactRoute,
  faqRoute,
  servicesRoute,
  copy,
}: FAQDetailPageViewProps): ReactElement {
  return (
    <div>
      <Section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-screen flex items-center">
        <video className="absolute inset-0 w-full h-full object-cover" src="/videos/space-bg-2.mp4" loop autoPlay muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/30 to-light-blue-cyan/20" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/svgs/question-pattern.svg')", backgroundRepeat: 'repeat', backgroundSize: '40px 40px' }} />
        <div className="relative text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">{faq.title}</h1>
          <div className="flex flex-col sm:flex-row justify-center gap-5 mt-10">
            <MarketingButton href={contactRoute} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              {copy.ctaContact}
            </MarketingButton>
            <MarketingButton href={faqRoute} variant="outline" size="lg" className="shadow-lg" withArrow>
              {copy.ctaViewAll}
            </MarketingButton>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <FAQItem slug={slug} incrementViews />
        </Section>
      </div>

      <CTASection
        title={copy.ctaTitle}
        subtitle={copy.ctaSubtitle}
        primaryCTA={{ text: copy.ctaPrimary, href: contactRoute }}
        secondaryCTA={{ text: copy.ctaSecondary, href: servicesRoute }}
        variant="default"
      />
    </div>
  );
}
