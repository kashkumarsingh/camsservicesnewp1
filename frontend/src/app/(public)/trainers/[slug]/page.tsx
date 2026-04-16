import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { GetTrainerUseCase, ListTrainersUseCase } from '@/core/application/trainers';
import { trainerRepository } from '@/infrastructure/persistence/trainers';
import { TrainerDetailPageView } from '@/marketing/components/trainers/TrainerDetailPageView';
import { ROUTES } from '@/shared/utils/routes';
import { buildPublicMetadata } from '@/marketing/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/marketing/utils/seoConstants';
import { TRAINER_DETAIL_PAGE as T } from '@/app/(public)/constants/trainerDetailPageConstants';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const getTrainerUseCase = new GetTrainerUseCase(trainerRepository);

  try {
    const trainer = await getTrainerUseCase.execute(slug);

    if (!trainer) {
      return {};
    }

    const title = `${trainer.name} - ${trainer.role} | ${SEO_DEFAULTS.siteName}`;
    const description = trainer.summary?.slice(0, 160) ?? undefined;
    return buildPublicMetadata(
      { title, description, path: ROUTES.TRAINER_BY_SLUG(slug), imageAlt: trainer.name },
      BASE_URL
    );
  } catch (error) {
    console.warn(
      `[TrainerDetailsPage] Failed to build metadata for trainer "${slug}". Returning empty metadata.`,
      error,
    );
    return {};
  }
}

import { withTimeoutFallback } from '@/marketing/utils/promiseUtils';

export default async function TrainerDetailsPage({ params }: Props) {
  const { slug } = await params;
  const getTrainerUseCase = new GetTrainerUseCase(trainerRepository);

  // Use timeout for fast failure
  const trainer = await withTimeoutFallback(
    getTrainerUseCase.execute(slug),
    3500, // 3.5s timeout – allow a bit more time for single trainer detail
    null
  );

  if (!trainer) {
    notFound();
  }

  const listTrainersUseCase = new ListTrainersUseCase(trainerRepository);
  
  // Use timeout for additional trainers - non-blocking
  const allTrainers = await withTimeoutFallback(
    listTrainersUseCase.execute({ sortBy: 'rating', sortOrder: 'desc' }),
    2500, // 2.5s timeout for sidebar suggestions
    []
  );
  const otherTrainers = allTrainers.filter((t) => t.slug !== slug).slice(0, 3);

  return (
    <TrainerDetailPageView
      trainer={trainer}
      otherTrainers={otherTrainers}
      contactRoute={ROUTES.CONTACT}
      trainersRoute={ROUTES.TRAINERS}
      packagesRoute={ROUTES.PACKAGES}
      copy={{
        ctaBook: T.CTA_BOOK,
        ctaViewAll: T.CTA_VIEW_ALL,
        atAGlance: T.AT_A_GLANCE,
        rating: T.RATING,
        certifications: T.CERTIFICATIONS,
        specialties: T.SPECIALTIES,
        contact: T.CONTACT,
        keyHighlights: T.KEY_HIGHLIGHTS,
        highlight1: T.HIGHLIGHT_1,
        highlight2Template: T.HIGHLIGHT_2_TEMPLATE,
        highlight3: T.HIGHLIGHT_3,
        meetOthersTitle: T.MEET_OTHERS_TITLE,
        meetOthersSubtitle: T.MEET_OTHERS_SUBTITLE,
        ctaTitleTemplate: T.CTA_TITLE_TEMPLATE,
        ctaSubtitleTemplate: T.CTA_SUBTITLE_TEMPLATE,
        ctaPrimary: T.CTA_PRIMARY,
        ctaSecondary: T.CTA_SECONDARY,
      }}
    />
  );
}
