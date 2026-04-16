import type { Metadata } from 'next';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { ROUTES } from '@/shared/utils/routes';
import { TRAINERS_PAGE, type TrainersPageContentResolved } from '@/app/(public)/constants/trainersPageConstants';
import { TrainersPageClient } from '@/marketing/components/trainers/TrainersPageClient';
import { GetPageUseCase } from '@/core/application/pages/useCases/GetPageUseCase';
import { pageRepository } from '@/infrastructure/persistence/pages';
import type { TrainersPageContentDTO } from '@/core/application/pages/dto/PageDTO';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const TRAINERS_SLUG = 'trainers';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

async function getTrainersPage() {
  const useCase = new GetPageUseCase(pageRepository);
  return useCase.execute(TRAINERS_SLUG);
}

function resolveContent(
  page: Awaited<ReturnType<typeof getTrainersPage>>,
  sc: TrainersPageContentDTO | undefined
): TrainersPageContentResolved {
  return {
    hero: {
      title: sc?.hero?.title?.trim() ?? page?.title ?? TRAINERS_PAGE.HERO_TITLE,
      subtitle: sc?.hero?.subtitle?.trim() ?? page?.summary ?? TRAINERS_PAGE.HERO_SUBTITLE,
      ctaPrimary: sc?.hero?.ctaPrimary?.trim() ?? TRAINERS_PAGE.HERO_CTA_PRIMARY,
      ctaPrimaryHref: sc?.hero?.ctaPrimaryHref?.trim() || ROUTES.CONTACT,
      ctaSecondary: sc?.hero?.ctaSecondary?.trim() ?? TRAINERS_PAGE.HERO_CTA_SECONDARY,
      ctaSecondaryHref: sc?.hero?.ctaSecondaryHref?.trim() || ROUTES.SERVICES,
    },
    stats: {
      mentorsLabel: sc?.stats?.mentorsLabel?.trim() ?? TRAINERS_PAGE.STATS_MENTORS_LABEL,
      ratingLabel: sc?.stats?.ratingLabel?.trim() ?? TRAINERS_PAGE.STATS_RATING_LABEL,
      dbsLabel: sc?.stats?.dbsLabel?.trim() ?? TRAINERS_PAGE.STATS_DBS_LABEL,
    },
    section: {
      title: sc?.section?.title?.trim() ?? TRAINERS_PAGE.SECTION_TITLE,
      subtitle: sc?.section?.subtitle?.trim() ?? TRAINERS_PAGE.SECTION_SUBTITLE,
    },
    joinSection: {
      title: sc?.joinSection?.title?.trim() ?? TRAINERS_PAGE.JOIN_TITLE,
      subtitle: sc?.joinSection?.subtitle?.trim() ?? TRAINERS_PAGE.JOIN_SUBTITLE,
      ctaPrimary: sc?.joinSection?.ctaPrimary?.trim() ?? TRAINERS_PAGE.JOIN_CTA_PRIMARY,
      ctaPrimaryHref: sc?.joinSection?.ctaPrimaryHref?.trim() || ROUTES.BECOME_A_TRAINER,
      ctaSecondary: sc?.joinSection?.ctaSecondary?.trim() ?? TRAINERS_PAGE.JOIN_CTA_SECONDARY,
      ctaSecondaryHref:
        sc?.joinSection?.ctaSecondaryHref?.trim() || `${ROUTES.BECOME_A_TRAINER}#application-form`,
      contactEmailText:
        sc?.joinSection?.contactEmailText?.trim() ?? TRAINERS_PAGE.JOIN_CONTACT_EMAIL_TEXT,
    },
    cta: {
      title: sc?.cta?.title?.trim() ?? TRAINERS_PAGE.CTA_TITLE,
      subtitle: sc?.cta?.subtitle?.trim() ?? TRAINERS_PAGE.CTA_SUBTITLE,
      primaryText: sc?.cta?.primaryText?.trim() ?? TRAINERS_PAGE.CTA_PRIMARY,
      primaryHref: sc?.cta?.primaryHref?.trim() || ROUTES.CONTACT,
      secondaryText: sc?.cta?.secondaryText?.trim() ?? TRAINERS_PAGE.CTA_SECONDARY,
      secondaryHref: sc?.cta?.secondaryHref?.trim() || 'mailto:info@camsservices.co.uk',
    },
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const page = await getTrainersPage();
  const sc =
    page?.structuredContent &&
    typeof page.structuredContent === 'object' &&
    'hero' in page.structuredContent
      ? (page.structuredContent as TrainersPageContentDTO)
      : undefined;
  const title =
    page?.title?.trim() ??
    sc?.hero?.title?.trim() ??
    TRAINERS_PAGE.META_TITLE;
  const description =
    page?.summary?.trim() ??
    sc?.hero?.subtitle?.trim() ??
    TRAINERS_PAGE.META_DESCRIPTION;

  return buildPublicMetadata(
    {
      title: title ? `${title} - ${SEO_DEFAULTS.siteName}` : TRAINERS_PAGE.META_TITLE,
      description: description ?? TRAINERS_PAGE.META_DESCRIPTION,
      path: ROUTES.TRAINERS,
      imageAlt: TRAINERS_PAGE.HERO_TITLE,
    },
    BASE_URL
  );
}

export default async function TrainersPage() {
  const page = await getTrainersPage();
  const sc =
    page?.structuredContent &&
    typeof page.structuredContent === 'object' &&
    'hero' in page.structuredContent
      ? (page.structuredContent as TrainersPageContentDTO)
      : undefined;
  const content = resolveContent(page, sc);

  return <TrainersPageClient content={content} />;
}
