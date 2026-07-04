import { FAQPageView } from '@/marketing/components/faq/FAQPageView';
import { FAQSeoIntro } from '@/marketing/components/faq/FAQSeoIntro';
import { Metadata } from 'next';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import { ListFAQItemsUseCase } from '@/core/application/faq/useCases/ListFAQItemsUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';
import { faqItems } from '@/data/faqData';
import { ROUTES } from '@/shared/utils/routes';
import { buildCmsPageMetadata } from '@/marketing/server/metadata/buildCmsPageMetadata';
import {
  FAQ_PAGE,
  FAQ_PAGE_HERO_DEFAULT_VIDEO,
} from '@/app/(public)/constants/faqPageConstants';
import type { FAQPageContentDTO } from '@/core/application/pages/dto/PageDTO';
import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const FAQ_SLUG = 'faq';

async function getFAQPage() {
  const useCase = new GetPageUseCase(pageRepository);
  return useCase.execute(FAQ_SLUG);
}

async function getServerFaqs(): Promise<Array<{ question: string; answer: string }>> {
  const useCase = new ListFAQItemsUseCase(faqRepository);
  const items = await withTimeoutFallback(useCase.execute({ limit: 20 }), 5000, []);
  if (items.length > 0) {
    return items
      .filter((faq) => faq.title?.trim() && faq.content?.trim())
      .map((faq) => ({ question: faq.title.trim(), answer: faq.content.trim() }));
  }
  return faqItems.map((item) => ({
    question: item.title,
    answer: item.content,
  }));
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getFAQPage();
  const sc = page?.structuredContent as FAQPageContentDTO | undefined;

  return buildCmsPageMetadata(
    {
      title: page?.title?.trim() ?? sc?.hero?.title?.trim() ?? FAQ_PAGE.META_TITLE,
      summary:
        page?.summary?.trim() ??
        sc?.hero?.subtitle?.trim() ??
        FAQ_PAGE.META_DESCRIPTION,
      metaTitle: page?.metaTitle,
      metaDescription: page?.metaDescription,
      ogImage: page?.ogImage,
    },
    ROUTES.FAQ
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

  const introHeading = sc?.intro?.heading?.trim() || FAQ_PAGE.INTRO_HEADING;
  const introBody = sc?.intro?.body?.trim() || FAQ_PAGE.INTRO_BODY;

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

  const serverFaqs = useContentItems ? [] : await getServerFaqs();

  let faqStructuredData: Array<Record<string, unknown>> = [];
  if (useContentItems && accordionFaqs.length > 0) {
    faqStructuredData = accordionFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }));
  } else if (serverFaqs.length > 0) {
    faqStructuredData = serverFaqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    }));
  }

  const faqJsonLd =
    faqStructuredData.length > 0
      ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqStructuredData }
      : null;

  return (
    <>
      <FAQSeoIntro heading={heroTitle} body={introBody} />
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
      introBody={undefined}
      useContentItems={useContentItems}
      accordionFaqs={accordionFaqs}
      serverFaqs={serverFaqs}
      ctaTitle={ctaTitle}
      ctaSubtitle={ctaSubtitle}
      ctaPrimaryText={ctaPrimaryText}
      ctaPrimaryHref={ctaPrimaryHref}
      ctaSecondaryText={ctaSecondaryText}
      ctaSecondaryHref={ctaSecondaryHref}
      contactRoute={ROUTES.CONTACT}
      servicesRoute={ROUTES.SERVICES}
      heroTitleAs="h2"
    />
    </>
  );
}
