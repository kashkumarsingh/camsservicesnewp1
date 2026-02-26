import type { Metadata } from 'next';
import { TrainerApplicationForm } from '@/components/trainerApplications/TrainerApplicationForm';
import { CheckCircle2, MapPin, Shield, Sparkles } from 'lucide-react';
import Section from '@/components/layout/Section';
import CTASection from '@/components/shared/CTASection';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/utils/routes';
import { BECOME_A_TRAINER_PAGE as B } from '@/app/(public)/constants/becomeATrainerPageConstants';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

export async function generateMetadata(): Promise<Metadata> {
  return buildPublicMetadata(
    {
      title: B.META_TITLE,
      description: B.META_DESCRIPTION,
      path: ROUTES.BECOME_A_TRAINER,
      imageAlt: B.HERO_TITLE,
    },
    BASE_URL
  );
}

const highlights = [
  { title: B.HIGHLIGHT_1_TITLE, description: B.HIGHLIGHT_1_DESC, icon: Sparkles },
  { title: B.HIGHLIGHT_2_TITLE, description: B.HIGHLIGHT_2_DESC, icon: MapPin },
  { title: B.HIGHLIGHT_3_TITLE, description: B.HIGHLIGHT_3_DESC, icon: Shield },
];

export default function BecomeTrainerPage() {
  return (
    <main>
      {/* Hero Section */}
      <Section className="border-b border-primary-blue/20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight text-navy-blue">
            {B.HERO_TITLE}
          </h1>
          <p className="mt-4 text-base md:text-lg text-navy-blue/80 max-w-2xl mx-auto">
            {B.HERO_SUBTITLE}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-navy-blue/80">
            <span>{B.HERO_STATS_AVG}</span>
            <span>·</span>
            <span>{B.HERO_STATS_LEVEL}</span>
          </div>
          <div className="mt-8">
            <Button href="#application-form" variant="primary" size="lg" withArrow>
              {B.HERO_CTA}
            </Button>
          </div>
        </div>
      </Section>

      {/* Main Content Section */}
      <div className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Section>
          <div className="grid max-w-6xl mx-auto gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              {/* Highlights Cards */}
              <div className="rounded-card border-2 border-primary-blue/20 bg-white p-6 sm:p-8 shadow-card">
                <div className="grid gap-4 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-card border-2 border-primary-blue/20 bg-primary-blue/10 p-4">
                      <div className="w-10 h-10 rounded-lg bg-primary-blue/20 flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-navy-blue" />
                      </div>
                      <p className="text-sm font-heading font-bold text-navy-blue">{item.title}</p>
                      <p className="mt-1 text-sm text-navy-blue/80">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How Onboarding Works */}
              <div className="rounded-card border-2 border-primary-blue/20 bg-white p-6 sm:p-8 shadow-card">
                <h2 className="text-xl font-heading font-bold text-navy-blue mb-4">{B.ONBOARDING_HEADING}</h2>
                <div className="space-y-3">
                  {[B.ONBOARDING_STEP_1, B.ONBOARDING_STEP_2, B.ONBOARDING_STEP_3].map((step) => (
                    <div key={step} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-primary-blue flex-shrink-0" />
                      <p className="text-sm text-navy-blue/80">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="rounded-card border-2 border-primary-blue/20 bg-primary-blue/10 p-6 sm:p-8 shadow-card">
                <p className="text-xs font-semibold uppercase tracking-wide text-navy-blue/80">{B.SUPPORT_LABEL}</p>
                <h3 className="mt-2 text-lg font-heading font-bold text-navy-blue">{B.SUPPORT_TITLE}</h3>
                <p className="mt-2 text-sm text-navy-blue/80">
                  Email <a href={B.SUPPORT_EMAIL} className="font-medium text-navy-blue underline hover:no-underline">{B.SUPPORT_EMAIL_DISPLAY}</a>
                  {B.SUPPORT_DESC_SUFFIX}
                </p>
                <div className="mt-4">
                  <Button
                    href={B.SUPPORT_EMAIL}
                    variant="bordered"
                    size="lg"
                    withArrow
                  >
                    {B.SUPPORT_CTA}
                  </Button>
                </div>
              </div>
            </div>

            {/* Application Form */}
            <div className="lg:sticky lg:top-8 lg:h-fit">
              <TrainerApplicationForm />
            </div>
          </div>
        </Section>
      </div>

      {/* CTA Section */}
      <CTASection
        title={B.CTA_TITLE}
        subtitle={B.CTA_SUBTITLE}
        primaryCTA={{ text: B.CTA_PRIMARY, href: '#application-form' }}
        secondaryCTA={{ text: B.CTA_SECONDARY, href: ROUTES.TRAINERS }}
        variant="default"
      />
    </main>
  );
}
