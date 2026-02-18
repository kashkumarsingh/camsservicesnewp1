import type { Metadata } from 'next';
import { TrainerApplicationForm } from '@/components/trainerApplications/TrainerApplicationForm';
import { CheckCircle2, MapPin, Shield, Sparkles } from 'lucide-react';
import Section from '@/components/layout/Section';
import CTASection from '@/components/shared/CTASection';
import Button from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Become a Trainer – CAMS Services',
  description:
    'Join CAMS Services as a specialist trainer. Share your availability, safeguarding credentials, and service areas to work with families across London & Essex.',
};

const highlights = [
  {
    title: 'Families ready to book',
    description: 'Parents arrive with clear goals and prepaid hours, so you focus on coaching not chasing payments.',
    icon: Sparkles,
  },
  {
    title: 'Location smart matching',
    description: 'We match you to bookings within the radius you define, powered by live availability + conflict checks.',
    icon: MapPin,
  },
  {
    title: 'Safeguarding first',
    description: 'DBS, insurance, and speciality tags live in one profile so operations can fast-track assignments.',
    icon: Shield,
  },
];

export default function BecomeTrainerPage() {
  return (
    <main>
      {/* Hero Section */}
      <Section className="border-b border-slate-200 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Become a trainer
          </h1>
          <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
            CAMS Services pairs expert coaches with families investing in bespoke activity plans. Share your
            safeguarding, coverage radius, and specialisms to unlock curated bookings across London & Essex.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
            <span>Avg. assignment time: 48 hours</span>
            <span>·</span>
            <span>Level 3 safeguarding required</span>
          </div>
          <div className="mt-8">
            <Button href="#application-form" variant="primary" size="lg" withArrow>
              Start application
            </Button>
          </div>
        </div>
      </Section>

      {/* Main Content Section */}
      <div className="py-16 bg-white">
        <Section>
          <div className="grid max-w-6xl mx-auto gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-6">
              {/* Highlights Cards */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <div className="grid gap-4 sm:grid-cols-3">
                  {highlights.map((item) => (
                    <div key={item.title} className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-900/5 flex items-center justify-center mb-3">
                        <item.icon className="h-5 w-5 text-slate-700" />
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* How Onboarding Works */}
              <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">How onboarding works</h2>
                <div className="space-y-3">
                  {[
                    'Submit the profile form with safeguarding & coverage details.',
                    'Operations review and approve within 2-3 working days.',
                    'You receive portal access plus curated bookings that match your profile.',
                  ].map((step) => (
                    <div key={step} className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-slate-500 flex-shrink-0" />
                      <p className="text-sm text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Support Section */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Need a hand?</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900">Dedicated onboarding support</h3>
                <p className="mt-2 text-sm text-slate-700">
                  Email <a href="mailto:coaches@camsservices.co.uk" className="font-medium text-slate-900 underline hover:no-underline">coaches@camsservices.co.uk</a> for help with
                  documentation or to fast-track multi-coach teams.
                </p>
                <div className="mt-4">
                  <Button
                    href="mailto:coaches@camsservices.co.uk"
                    variant="bordered"
                    size="lg"
                    withArrow
                  >
                    Contact onboarding
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
        title="Ready to Join Our Team?"
        subtitle="Start your journey as a CAMS trainer and make a lasting impact on children's lives."
        primaryCTA={{ text: 'Submit Your Application', href: '#application-form' }}
        secondaryCTA={{ text: 'View Current Trainers', href: '/trainers' }}
        variant="default"
      />
    </main>
  );
}


