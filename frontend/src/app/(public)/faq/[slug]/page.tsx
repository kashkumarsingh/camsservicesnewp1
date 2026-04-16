import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { FAQDetailPageView } from '@/marketing/components/faq/FAQDetailPageView';
import { GetFAQItemUseCase } from '@/core/application/faq/useCases/GetFAQItemUseCase';
import { faqRepository } from '@/infrastructure/persistence/faq';
import { ROUTES } from '@/shared/utils/routes';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { FAQ_DETAIL_PAGE as F } from '@/app/(public)/constants/faqDetailPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

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

  const title = `${faq.title} - ${SEO_DEFAULTS.siteName} FAQ`;
  const description = faq.content ?? undefined;
  return buildPublicMetadata(
    { title, description, path: `/faq/${slug}`, imageAlt: faq.title },
    BASE_URL
  );
}

import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

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
    <FAQDetailPageView
      faq={faq}
      slug={slug}
      contactRoute={ROUTES.CONTACT}
      faqRoute={ROUTES.FAQ}
      servicesRoute={ROUTES.SERVICES}
      copy={{
        ctaContact: F.CTA_CONTACT,
        ctaViewAll: F.CTA_VIEW_ALL,
        ctaTitle: F.CTA_TITLE,
        ctaSubtitle: F.CTA_SUBTITLE,
        ctaPrimary: F.CTA_PRIMARY,
        ctaSecondary: F.CTA_SECONDARY,
      }}
    />
  );
}
