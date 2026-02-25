import React from 'react';
import { Metadata } from 'next';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import Button from '@/components/ui/Button';
import Section from '@/components/layout/Section';
import CTASection from '@/components/shared/CTASection/CTASection';
import Card from '@/components/ui/Card/Card';
import IconList from '@/components/ui/IconList/IconList';
import { CheckCircle2, Calendar, Phone, MessageSquare, Award, Shield, Sparkles, Star, Users, Clock } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://camsservice.co.uk';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Thank You – We'll Be in Touch | CAMS Services",
  description: "Your enquiry has been received. Our team will review your request and get back to you within 24 hours.",
  alternates: {
    canonical: `${BASE_URL}${ROUTES.CONTACT_THANK_YOU}`,
  },
};

const nextSteps = [
  {
    title: 'Dedicated Review',
    description: 'A programme lead reviews your enquiry and matches you with the best mentor or psychologist.',
  },
  {
    title: 'Personal Contact',
    description: 'We reach out within 24 hours via your preferred method to schedule the consultation.',
  },
  {
    title: 'Custom Roadmap',
    description: 'During the call we co-create a success plan with clear milestones for your child.',
  },
];

const reassuranceHighlights = [
  { text: '4.9/5 average family satisfaction score' },
  { text: 'DBS-checked safeguarding mentors' },
  { text: 'Ofsted-registered trauma-informed framework' },
  { text: '500+ families supported across London & Essex' },
];


export default async function ContactThankYouPage() {
  const settings = await getSiteSettings().catch(() => null);
  const contact = settings?.contact;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Hero Section - Enhanced with Video Background */}
      <Section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 text-white overflow-hidden min-h-[85vh] flex items-center">
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="/videos/space-bg-2.mp4"
          loop
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/40 to-navy-blue/60 z-10"></div>
        <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: "repeat", backgroundSize: "40px 40px" }}></div>
        
        <div className="relative z-20 text-center max-w-5xl mx-auto space-y-8">
          {/* Success Icon */}
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-sm shadow-2xl shadow-blue-500/20 border border-white/30">
            <CheckCircle2 className="text-green-400" size={56} strokeWidth={2.5} />
          </div>
          
          {/* Badge */}
          <div className="inline-block bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full">
            <p className="text-sm font-semibold flex items-center justify-center gap-2">
              <Sparkles size={18} />
              Message Received Successfully
            </p>
          </div>
          
          {/* Heading */}
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/90 font-semibold">We've Got Your Message</p>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
              Thank you for sharing your story with us.
            </h1>
          </div>
          
          {/* Description */}
          <p className="mx-auto max-w-3xl text-xl md:text-2xl text-white/90 font-light">
            Our safeguarding team is reviewing your enquiry right now. We'll be in touch within 24 hours with your next
            steps. While you wait, explore our programmes or jump straight to a free discovery call.
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Star className="text-light-blue-cyan" size={20} fill="currentColor" />
              <span className="font-semibold text-sm">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Shield className="text-light-blue-cyan" size={20} />
              <span className="font-semibold text-sm">DBS Checked</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Award className="text-purple-300" size={20} />
              <span className="font-semibold text-sm">Ofsted Registered</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Users className="text-light-blue-cyan" size={20} />
              <span className="font-semibold text-sm">500+ Families</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <Button href={ROUTES.PACKAGES} variant="superPlayful" size="lg" className="shadow-2xl text-lg" withArrow>
              Explore Tailored Programmes
            </Button>
            <Button href="/booking" variant="outline" size="lg" className="text-lg shadow-lg" withArrow>
              Book A Free Discovery Call
            </Button>
          </div>
        </div>
      </Section>

      {/* Next Steps & Support Section */}
      <Section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          <Card className="rounded-3xl border border-gray-100 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Clock className="text-primary-blue" size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue">What happens next</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold text-navy-blue">A guided next step for every family</h2>
            <p className="mt-4 text-lg text-navy-blue/80">
              Your enquiry is routed to our specialist mentors instantly. We follow a simple three-step process so you
              always know what comes next.
            </p>
            <div className="mt-8 space-y-5">
              {nextSteps.map((step, index) => (
                <div key={step.title} className="flex gap-5 rounded-card border-2 border-gray-100 bg-gradient-to-r from-white to-blue-50/50 p-5 hover:border-primary-blue/30 hover:shadow-card-hover transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary-blue to-light-blue-cyan flex items-center justify-center">
                    <span className="text-xl font-bold text-white">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-lg text-navy-blue mb-1">{step.title}</p>
                    <p className="text-sm text-navy-blue/70 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl border-2 border-navy-blue bg-gradient-to-br from-navy-blue to-footer-dark text-white shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-white/20">
                <MessageSquare className="text-white" size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-white/90">Need to talk sooner?</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold">We're here for urgent support</h2>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              Choose the channel that suits you best. Safeguarding mentors respond quickly, including evenings and
              weekends.
            </p>
            <div className="mt-8 space-y-4">
              <Button
                href={contact?.phone ? `tel:${contact.phone}` : undefined}
                variant="outlineWhite"
                className="w-full justify-between border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                disabled={!contact?.phone}
              >
                <span className="flex items-center gap-3">
                  <Phone size={20} />
                  <span className="font-semibold">{contact?.phone ?? 'Phone number coming soon'}</span>
                </span>
                <span className="text-sm opacity-70">Call us directly</span>
              </Button>
              <Button
                href={contact?.whatsappUrl || undefined}
                variant="bordered"
                className="w-full justify-between border-2 border-white/60 !bg-white/10 hover:!bg-white/20 text-white transition-all duration-300"
                disabled={!contact?.whatsappUrl}
              >
                <span className="flex items-center gap-3">
                  <MessageSquare size={20} />
                  <span className="font-semibold">WhatsApp Support</span>
                </span>
                <span className="text-sm opacity-70">Secure chat</span>
              </Button>
              <Button
                href="/booking"
                variant="outlineWhite"
                className="w-full justify-between border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                withArrow
              >
                <span className="flex items-center gap-3">
                  <Calendar size={20} />
                  <span className="font-semibold">Schedule a Call</span>
                </span>
                <span className="text-sm opacity-70">Pick a time</span>
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Trust & Preparation Section */}
      <Section className="py-20 bg-white">
        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          <Card className="rounded-3xl border-2 border-gray-100 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-100">
                <Shield className="text-green-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-navy-blue">Why families trust CAMS</h3>
            </div>
            <IconList items={reassuranceHighlights} />
          </Card>

          <Card className="rounded-3xl border-2 border-gray-100 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-100">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <h3 className="text-2xl font-bold text-navy-blue">Need to prepare for the call?</h3>
            </div>
            <IconList
              items={[
                { text: 'Write down key concerns, routines, or triggers you want to discuss.' },
                { text: 'Let us know preferred availability so we can match your schedule.' },
                { text: 'Share any reports or EHCP details during the consultation.' },
                { text: "We'll recap the plan in writing so your whole team stays aligned." },
              ]}
            />
          </Card>
        </div>
      </Section>

      <CTASection
        title="Ready to build your child’s success plan?"
        subtitle="Our trauma-informed mentors combine emotional support with practical strategies. Let’s co-create a programme that fits your family."
        primaryCTA={{ text: 'View Success Stories', href: ROUTES.BLOG }}
        secondaryCTA={{ text: 'Return Home', href: '/' }}
        variant="default"
      />
    </div>
  );
}

