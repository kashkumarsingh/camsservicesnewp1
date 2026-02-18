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

    return {
      title: `${trainer.name} - ${trainer.role} | CAMS Services`,
      description: trainer.summary.slice(0, 160),
    };
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
        <div className="absolute inset-0 bg-gradient-to-br from-[#0080FF]/50 to-[#00D4FF]/30 z-10" />
        <div className="relative z-20 text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
            {trainer.name}
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">
            {trainer.role}
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <Button href="/contact" variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              Book a Session
            </Button>
            <Button href="/trainers" variant="outline" size="lg" className="shadow-lg" withArrow>
              View All Team Members
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
              <div className="bg-white rounded-[24px] border-2 border-gray-200 p-5 shadow-sm">
                <h4 className="font-bold text-[#1E3A5F] mb-3">At a Glance</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>
                    <span className="font-semibold">Rating:</span> {trainer.rating.toFixed(1)}/5
                  </li>
                  {trainer.certifications.length > 0 && (
                    <li>
                      <span className="font-semibold">Certifications:</span> {trainer.certifications.length}
                    </li>
                  )}
                  {trainer.specialties.length > 0 && (
                    <li>
                      <span className="font-semibold">Specialties:</span> {trainer.specialties.length}
                    </li>
                  )}
                </ul>
                <div className="mt-4">
                  <Button href="/contact" variant="primary" size="md" className="w-full">
                    Contact
                  </Button>
                </div>
              </div>

              <div className="bg-white rounded-[24px] border-2 border-gray-200 p-5 shadow-sm">
                <h4 className="font-bold text-[#1E3A5F] mb-3">Key Highlights</h4>
                <ul className="text-sm text-gray-700 space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#0080FF] flex-shrink-0 mt-1" size={20} />
                    <span>Fully DBS checked and certified.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#0080FF] flex-shrink-0 mt-1" size={20} />
                    <span>Experienced in {trainer.specialties.slice(0, 2).join(', ')}.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="text-[#0080FF] flex-shrink-0 mt-1" size={20} />
                    <span>Available for tailored support plans.</span>
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
          <Section title="Meet Other Specialists" subtitle="Explore more of our dedicated team members.">
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
        title={`Ready to Work with ${trainer.name}?`}
        subtitle={`Contact us today to learn more about how ${trainer.name} can support your child's development.`}
        primaryCTA={{ text: 'Get Started Today', href: '/contact' }}
        secondaryCTA={{ text: 'View Our Packages', href: '/packages' }}
        variant="default"
      />
    </div>
  );
}
