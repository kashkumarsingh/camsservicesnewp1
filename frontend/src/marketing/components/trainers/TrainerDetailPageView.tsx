import type { ReactElement } from 'react';
import { CheckCircle2 } from 'lucide-react';
import Section from '@/components/layout/Section';
import MarketingButton from '@/design-system/components/Button/MarketingButton';
import CTASection from '@/components/shared/CTASection';
import TrainerProfile from '@/interfaces/web/components/trainers/TrainerProfile';
import TrainerCard from '@/interfaces/web/components/trainers/TrainerCard';
import type { TrainerDTO } from '@/core/application/trainers/dto/TrainerDTO';

type TrainerDetailPageViewProps = {
  trainer: TrainerDTO;
  otherTrainers: TrainerDTO[];
  contactRoute: string;
  trainersRoute: string;
  packagesRoute: string;
  copy: {
    ctaBook: string;
    ctaViewAll: string;
    atAGlance: string;
    rating: string;
    certifications: string;
    specialties: string;
    contact: string;
    keyHighlights: string;
    highlight1: string;
    highlight2Template: string;
    highlight3: string;
    meetOthersTitle: string;
    meetOthersSubtitle: string;
    ctaTitleTemplate: string;
    ctaSubtitleTemplate: string;
    ctaPrimary: string;
    ctaSecondary: string;
  };
};

export function TrainerDetailPageView({
  trainer,
  otherTrainers,
  contactRoute,
  trainersRoute,
  packagesRoute,
  copy,
}: TrainerDetailPageViewProps): ReactElement {
  return (
    <div>
      <Section className="relative pt-16 pb-16 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-[40vh] flex items-center">
        <video className="absolute inset-0 w-full h-full object-cover" src="/videos/space-bg-2.webm" loop autoPlay muted playsInline />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/50 to-light-blue-cyan/30" />
        <div className="relative text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">{trainer.name}</h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto font-sans font-light">{trainer.role}</p>
          <div className="flex flex-col sm:flex-row justify-center gap-5">
            <MarketingButton href={contactRoute} variant="superPlayful" size="lg" className="shadow-lg" withArrow>
              {copy.ctaBook}
            </MarketingButton>
            <MarketingButton href={trainersRoute} variant="outline" size="lg" className="shadow-lg" withArrow>
              {copy.ctaViewAll}
            </MarketingButton>
          </div>
        </div>
      </Section>

      <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <Section>
          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <TrainerProfile trainer={trainer} />
            </div>
            <aside className="md:col-span-1 md:sticky md:top-28 space-y-6">
              <div className="bg-white rounded-card border-2 border-primary-blue/20 p-5 shadow-card">
                <h4 className="font-heading font-bold text-navy-blue mb-3">{copy.atAGlance}</h4>
                <ul className="text-sm text-navy-blue/80 space-y-2">
                  <li><span className="font-semibold">{copy.rating}:</span> {trainer.rating.toFixed(1)}/5</li>
                  {trainer.certifications.length > 0 && (
                    <li><span className="font-semibold">{copy.certifications}:</span> {trainer.certifications.length}</li>
                  )}
                  {trainer.specialties.length > 0 && (
                    <li><span className="font-semibold">{copy.specialties}:</span> {trainer.specialties.length}</li>
                  )}
                </ul>
                <div className="mt-4">
                  <MarketingButton href={contactRoute} variant="primary" size="md" className="w-full">
                    {copy.contact}
                  </MarketingButton>
                </div>
              </div>

              <div className="bg-white rounded-card border-2 border-primary-blue/20 p-5 shadow-card">
                <h4 className="font-heading font-bold text-navy-blue mb-3">{copy.keyHighlights}</h4>
                <ul className="text-sm text-navy-blue/80 space-y-3">
                  <li className="flex items-start gap-3"><CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} /><span>{copy.highlight1}</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} /><span>{copy.highlight2Template.replace('{{specialties}}', trainer.specialties.slice(0, 2).join(', '))}</span></li>
                  <li className="flex items-start gap-3"><CheckCircle2 className="text-primary-blue flex-shrink-0 mt-1" size={20} /><span>{copy.highlight3}</span></li>
                </ul>
              </div>
            </aside>
          </div>
        </Section>
      </div>

      {otherTrainers.length > 0 && (
        <div className="py-16 bg-gradient-to-br from-white to-blue-50">
          <Section title={copy.meetOthersTitle} subtitle={copy.meetOthersSubtitle}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {otherTrainers.map((other) => <TrainerCard key={other.id} trainer={other} />)}
            </div>
          </Section>
        </div>
      )}

      <CTASection
        title={copy.ctaTitleTemplate.replace('{{name}}', trainer.name)}
        subtitle={copy.ctaSubtitleTemplate.replace(/\{\{name\}\}/g, trainer.name)}
        primaryCTA={{ text: copy.ctaPrimary, href: contactRoute }}
        secondaryCTA={{ text: copy.ctaSecondary, href: packagesRoute }}
        variant="default"
      />
    </div>
  );
}
