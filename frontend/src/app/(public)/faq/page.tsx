import { FAQPageView } from '@/marketing/components/faq/FAQPageView';
import { Metadata } from 'next';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { ListFAQItemsUseCase } from '@/core/application/faq/useCases/ListFAQItemsUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';
import { ROUTES } from '@/shared/utils/routes';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import {
  FAQ_PAGE,
  FAQ_PAGE_HERO_DEFAULT_VIDEO,
} from '@/app/(public)/constants/faqPageConstants';
import type { FAQPageContentDTO } from '@/core/application/pages/dto/PageDTO';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const FAQ_SLUG = 'faq';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

async function getFAQPage() {
  const useCase = new GetPageUseCase(pageRepository);
  return useCase.execute(FAQ_SLUG);
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFAQPage();
  const sc = page?.structuredContent as FAQPageContentDTO | undefined;
  const title =
    page?.title?.trim() ??
    sc?.hero?.title?.trim() ??
    FAQ_PAGE.META_TITLE;
  const description =
    page?.summary?.trim() ??
    sc?.hero?.subtitle?.trim() ??
    FAQ_PAGE.META_DESCRIPTION;

  return buildPublicMetadata(
    {
      title: title ? `${title} - ${SEO_DEFAULTS.siteName}` : FAQ_PAGE.META_TITLE,
      description: description ?? FAQ_PAGE.META_DESCRIPTION,
      path: ROUTES.FAQ,
      imageAlt: 'CAMS Services FAQ',
    },
    BASE_URL
  );
}

export default async function FAQPage() {
  const page = await getFAQPage();
  const sc =
    page?.structuredContent &&
    typeof page.structuredContent === 'object' &&
    'hero' in page.structuredContent
      ? (page.structuredContent as FAQPageContentDTO)
      : undefined;

  const heroTitle = sc?.hero?.title?.trim() ?? page?.title ?? FAQ_PAGE.HERO_TITLE;
  const heroSubtitle = sc?.hero?.subtitle?.trim() ?? page?.summary ?? FAQ_PAGE.HERO_SUBTITLE;
  const heroCtaPrimary = sc?.hero?.ctaPrimary?.trim() || FAQ_PAGE.HERO_CTA_QUESTIONS;
  const heroCtaSecondary = sc?.hero?.ctaSecondary?.trim() || FAQ_PAGE.HERO_CTA_SERVICES;
  const heroBackgroundMedia = sc?.hero?.backgroundType ?? 'video';
  const heroVideoSrc = sc?.hero?.videoUrl?.trim() || FAQ_PAGE_HERO_DEFAULT_VIDEO;
  const heroImageSrc = sc?.hero?.imageUrl?.trim() || undefined;
  const heroButtonCount = sc?.hero?.buttonCount ?? 2;
  const heroButtonSize = sc?.hero?.buttonSize ?? 'lg';

  const introHeading = sc?.intro?.heading?.trim();
  const introBody = sc?.intro?.body?.trim();

  const contentItems = Array.isArray(sc?.items) ? sc.items : [];
  const useContentItems = contentItems.length > 0 && contentItems.some((i) => (i.question ?? '').trim() || (i.answer ?? '').trim());
  const accordionFaqs = useContentItems
    ? contentItems
        .filter((i) => (i.question ?? '').trim() || (i.answer ?? '').trim())
        .map((i) => ({ question: (i.question ?? '').trim(), answer: (i.answer ?? '').trim() }))
    : [];

  const ctaTitle = sc?.cta?.title?.trim() ?? FAQ_PAGE.CTA_TITLE;
  const ctaSubtitle = sc?.cta?.subtitle?.trim() ?? FAQ_PAGE.CTA_SUBTITLE;
  const ctaPrimaryText = sc?.cta?.primaryText?.trim() ?? FAQ_PAGE.CTA_PRIMARY;
  const ctaPrimaryHref = sc?.cta?.primaryHref?.trim() || ROUTES.CONTACT;
  const ctaSecondaryText = sc?.cta?.secondaryText?.trim() ?? FAQ_PAGE.CTA_SECONDARY;
  const ctaSecondaryHref = sc?.cta?.secondaryHref?.trim() || ROUTES.PACKAGES;

  let faqStructuredData: Array<Record<string, unknown>> = [];
  if (useContentItems && accordionFaqs.length > 0) {
    faqStructuredData = accordionFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }));
  } else {
    try {
      const listFaqUseCase = new ListFAQItemsUseCase(faqRepository);
      const faqItems = await withTimeoutFallback(
        listFaqUseCase.execute({ limit: 8 }),
        2500,
        []
      );
      faqStructuredData = faqItems
        .filter((faq) => faq.content?.trim())
        .map((faq) => ({
          '@type': 'Question',
          name: faq.title,
          acceptedAnswer: { '@type': 'Answer', text: faq.content },
        }));
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[FAQPage] Failed to build FAQ JSON-LD payload.', error);
      }
    }
  }

  const faqJsonLd =
    faqStructuredData.length > 0
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqStructuredData }
      : null;

  return (
    <FAQPageView
      faqJsonLd={faqJsonLd}
      heroTitle={heroTitle}
      heroSubtitle={heroSubtitle}
      heroBackgroundMedia={heroBackgroundMedia}
      heroVideoSrc={heroVideoSrc}
      heroImageSrc={heroImageSrc}
      heroButtonCount={heroButtonCount}
      heroButtonSize={heroButtonSize}
      heroCtaPrimary={heroCtaPrimary}
      heroCtaSecondary={heroCtaSecondary}
      introHeading={introHeading}
      introBody={introBody}
      useContentItems={useContentItems}
      accordionFaqs={accordionFaqs}
      ctaTitle={ctaTitle}
      ctaSubtitle={ctaSubtitle}
      ctaPrimaryText={ctaPrimaryText}
      ctaPrimaryHref={ctaPrimaryHref}
      ctaSecondaryText={ctaSecondaryText}
      ctaSecondaryHref={ctaSecondaryHref}
      contactRoute={ROUTES.CONTACT}
      servicesRoute={ROUTES.SERVICES}
    />
  );
}
