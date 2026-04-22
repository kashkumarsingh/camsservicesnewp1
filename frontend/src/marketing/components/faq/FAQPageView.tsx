import type { ReactElement } from 'react';
import Section from '@/components/layout/Section';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import CTASection from '@/components/shared/CTASection';
import { PageHero } from '@/components/shared/public-page';
import { FAQList } from '@/interfaces/web/components/faq';
import FAQAccordion from '@/marketing/components/features/faq/FAQAccordion';

type FaqEntry = { question: string; answer: string };

type FAQPageViewProps = {
  faqJsonLd: Record<string, unknown> | null;
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundMedia: 'video' | 'image';
  heroVideoSrc: string;
  heroImageSrc?: string;
  heroButtonCount: number;
  heroButtonSize: 'sm' | 'md' | 'lg';
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  introHeading?: string;
  introBody?: string;
  useContentItems: boolean;
  accordionFaqs: FaqEntry[];
  ctaTitle: string;
  ctaSubtitle: string;
  ctaPrimaryText: string;
  ctaPrimaryHref: string;
  ctaSecondaryText: string;
  ctaSecondaryHref: string;
  contactRoute: string;
  servicesRoute: string;
};

export function FAQPageView({
  faqJsonLd,
  heroTitle,
  heroSubtitle,
  heroBackgroundMedia,
  heroVideoSrc,
  heroImageSrc,
  heroButtonCount,
  heroButtonSize,
  heroCtaPrimary,
  heroCtaSecondary,
  introHeading,
  introBody,
  useContentItems,
  accordionFaqs,
  ctaTitle,
  ctaSubtitle,
  ctaPrimaryText,
  ctaPrimaryHref,
  ctaSecondaryText,
  ctaSecondaryHref,
  contactRoute,
  servicesRoute,
}: FAQPageViewProps): ReactElement {
  return (
    <div>
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      )}
      <PageHero
        title={heroTitle}
        subtitle={heroSubtitle}
        backgroundMedia={heroBackgroundMedia}
        videoSrc={heroVideoSrc}
        imageSrc={heroImageSrc}
      >
        {heroButtonCount >= 1 && (
          <MarketingButton
            href={contactRoute}
            variant="superPlayful"
            size={heroButtonSize}
            className="rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            withArrow
          >
            {heroCtaPrimary}
          </MarketingButton>
        )}
        {heroButtonCount >= 2 && (
          <MarketingButton
            href={servicesRoute}
            variant="outline"
            size={heroButtonSize}
            className="rounded-full bg-white text-primary-blue border-2 border-primary-blue shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            withArrow
          >
            {heroCtaSecondary}
          </MarketingButton>
        )}
      </PageHero>

      {(introHeading || introBody) && (
        <div className="py-12 bg-white">
          <Section>
            <div className="max-w-3xl mx-auto text-center">
              {introHeading && <h2 className="text-2xl font-heading font-bold text-navy-blue mb-4">{introHeading}</h2>}
              {introBody && <p className="text-slate-600 dark:text-slate-400">{introBody}</p>}
            </div>
          </Section>
        </div>
      )}

      <div className="py-14 md:py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="max-w-3xl mx-auto">
            {useContentItems && accordionFaqs.length > 0 ? (
              <FAQAccordion faqs={accordionFaqs} />
            ) : (
              <FAQList />
            )}
          </div>
        </Section>
      </div>

      <CTASection
        title={ctaTitle}
        subtitle={ctaSubtitle}
        primaryCTA={{ text: ctaPrimaryText, href: ctaPrimaryHref }}
        secondaryCTA={{ text: ctaSecondaryText, href: ctaSecondaryHref }}
        variant="default"
      />
    </div>
  );
}
