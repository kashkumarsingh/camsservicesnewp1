import { notFound } from 'next/navigation';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button/Button';
import CTASection from '@/components/shared/CTASection';
import { CheckCircle2 } from 'lucide-react';
import { Metadata } from 'next';
import { GetTrainerUseCase, ListTrainersUseCase } from '@/core/application/trainers';
import { trainerRepository } from '@/infrastructure/persistence/trainers';
import TrainerProfile from '@/interfaces/web/components/trainers/TrainerProfile';
import TrainerCard from '@/interfaces/web/components/trainers/TrainerCard';
import type { TrainerDTO } from '@/core/application/trainers/dto/TrainerDTO';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { SEO_DEFAULTS } from '@/utils/seoConstants';
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

import { withTimeoutFallback } from '@/utils/promiseUtils';

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
    <div>
      {/* Hero Section */}
      <Section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-[40vh] flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.webm"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/50 to-light-blue-cyan/30 z-10" />
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            {trainer.name}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            {trainer.role}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href={ROUTES.CONTACT} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              {T.CTA_BOOK}
            </Button>
            <Button href={ROUTES.TRAINERS} variant="outline" size="lg" className="shadow-lg" withArrow>
              {T.CTA_VIEW_ALL}
            </Button>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
            {/* Left Column: Trainer Details */}
            <div className="md:col-span-2">
              <TrainerProfile trainer={trainer} />
            </div>

            {/* Right Column: Sticky Card with key info */}
            <aside className="md:col-span-1 md:sticky md:top-28 space-y-6">
              <div className="bg-white rounded-card border-2 border-primary-blue/20 p-5 shadow-card">
                <h4 className="font-heading font-bold text-navy-blue mb-3">{T.AT_A_GLANCE}</h4>
                <ul className="text-sm text-navy-blue/80 space-y-2">
                  <li>
                    <span className="font-semibold">{T.RATING}:</span> {trainer.rating.toFixed(1)}/5
                  </li>
                  {trainer.certifications.length > 0 && (
                    <li>
                      <span className="font-semibold">{T.CERTIFICATIONS}:</span> {trainer.certifications.length}
                    </li>
                  )}
                  {trainer.specialties.length > 0 && (
                    <li>
                      <span className="font-semibold">{T.SPECIALTIES}:</span> {trainer.specialties.length}
                    </li>
                  )}
                </ul>
                <div className="mt-4">
                  <Button href={ROUTES.CONTACT} variant="primary" size="md" className="w-full">
                    {T.CONTACT}
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-card border-2 border-primary-blue/20 p-5 shadow-card">
                <h4 className="font-heading font-bold text-navy-blue mb-3">{T.KEY_HIGHLIGHTS}</h4>
                <ul className="text-sm text-navy-blue/80 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} />
                    <span>{T.HIGHLIGHT_1}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} />
                    <span>{T.HIGHLIGHT_2_TEMPLATE.replace('{{specialties}}', trainer.specialties.slice(0, 2).join(', '))}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} />
                    <span>{T.HIGHLIGHT_3}</span>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </Section>
      </div>

      {/* More Trainers */}
      {otherTrainers.length > 0 && (
        <div className="py-16 bg-gradient-to-br from-white to-blue-50">
          <Section title={T.MEET_OTHERS_TITLE} subtitle={T.MEET_OTHERS_SUBTITLE}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherTrainers.map((other) => (
                <TrainerCard key={other.id} trainer={other} />
              ))}
            </div>
          </Section>
        </div>
      )}

      {/* CTA Section */}
      <CTASection
        title={T.CTA_TITLE_TEMPLATE.replace('{{name}}', trainer.name)}
        subtitle={T.CTA_SUBTITLE_TEMPLATE.replace(/\{\{name\}\}/g, trainer.name)}
        primaryCTA={{ text: T.CTA_PRIMARY, href: ROUTES.CONTACT }}
        secondaryCTA={{ text: T.CTA_SECONDARY, href: ROUTES.PACKAGES }}
        variant="default"
      />
    </div>
  );
}
