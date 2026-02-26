import React from 'react';
import { getSiteSettings } from '@/server/siteSettings/getSiteSettings';
import Button from '@/components/ui/Button';
import Section from '@/components/layout/Section';
import CTASection from '@/components/shared/CTASection/CTASection';
import Card from '@/components/ui/Card/Card';
import IconList from '@/components/ui/IconList/IconList';
import { CheckCircle2, Calendar, Phone, MessageSquare, Award, Shield, Sparkles, Star, Users, Clock } from 'lucide-react';
import { ROUTES } from '@/utils/routes';
import { buildPublicMetadata } from '@/server/metadata/buildPublicMetadata';
import { CONTACT_THANK_YOU_PAGE as C } from '@/app/(public)/constants/contactThankYouPageConstants';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ?? 'https://camsservice.co.uk';

/** Literal required for Next.js segment config (see revalidationConstants.ts CONTENT_PAGE) */
export const revalidate = 1800;

export async function generateMetadata() {
  return buildPublicMetadata(
    {
      title: C.META_TITLE,
      description: C.META_DESCRIPTION,
      path: ROUTES.CONTACT_THANK_YOU,
      imageAlt: 'CAMS Services',
    },
    BASE_URL
  );
}

const nextSteps = [
  { title: C.NEXT_STEP_1_TITLE, description: C.NEXT_STEP_1_DESC },
  { title: C.NEXT_STEP_2_TITLE, description: C.NEXT_STEP_2_DESC },
  { title: C.NEXT_STEP_3_TITLE, description: C.NEXT_STEP_3_DESC },
];

const reassuranceHighlights = [
  { text: C.TRUST_HIGHLIGHT_1 },
  { text: C.TRUST_HIGHLIGHT_2 },
  { text: C.TRUST_HIGHLIGHT_3 },
  { text: C.TRUST_HIGHLIGHT_4 },
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
              {C.BADGE}
            </p>
          </div>
          
          {/* Heading */}
          <div>
            <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/90 font-semibold">{C.HEADING_SMALL}</p>
            <h1 className="text-5xl md:text-7xl font-heading font-extrabold mb-6 leading-tight tracking-tight heading-text-shadow">
              {C.HERO_TITLE}
            </h1>
          </div>
          
          {/* Description */}
          <p className="mx-auto max-w-3xl text-xl md:text-2xl text-white/90 font-light">
            {C.HERO_DESCRIPTION}
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Star className="text-light-blue-cyan" size={20} fill="currentColor" />
              <span className="font-semibold text-sm">{C.TRUST_4_9}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Shield className="text-light-blue-cyan" size={20} />
              <span className="font-semibold text-sm">{C.TRUST_DBS}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Award className="text-purple-300" size={20} />
              <span className="font-semibold text-sm">{C.TRUST_OFSTED}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-lg border border-white/20">
              <Users className="text-light-blue-cyan" size={20} />
              <span className="font-semibold text-sm">{C.TRUST_FAMILIES}</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <Button href={ROUTES.PACKAGES} variant="superPlayful" size="lg" className="shadow-2xl text-lg" withArrow>
              {C.CTA_EXPLORE}
            </Button>
            <Button href="/booking" variant="outline" size="lg" className="text-lg shadow-lg" withArrow>
              {C.CTA_BOOK_CALL}
            </Button>
          </div>
        </div>
      </Section>

      {/* Next Steps & Support Section */}
      <Section className="py-20 bg-gradient-to-br from-blue-50 to-white">
        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          <Card className="rounded-3xl border-2 border-primary-blue/20 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Clock className="text-primary-blue" size={24} />
              </div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary-blue">{C.NEXT_STEPS_LABEL}</p>
            </div>
            <h2 className="mt-2 text-3xl font-heading font-bold text-navy-blue">{C.NEXT_STEPS_TITLE}</h2>
            <p className="mt-4 text-lg text-navy-blue/80">
              {C.NEXT_STEPS_INTRO}
            </p>
            <div className="mt-8 space-y-5">
              {nextSteps.map((step, index) => (
                <div key={step.title} className="flex gap-5 rounded-card border-2 border-primary-blue/20 bg-gradient-to-r from-white to-blue-50/50 p-5 hover:border-primary-blue/30 hover:shadow-card-hover transition-all duration-300">
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
              <p className="text-sm font-semibold uppercase tracking-wide text-white/90">{C.URGENT_LABEL}</p>
            </div>
            <h2 className="mt-2 text-3xl font-bold">{C.URGENT_TITLE}</h2>
            <p className="mt-4 text-lg text-white/90 leading-relaxed">
              {C.URGENT_DESC}
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
                  <span className="font-semibold">{contact?.phone ?? C.PHONE_PLACEHOLDER}</span>
                </span>
                <span className="text-sm opacity-70">{C.CALL_US}</span>
              </Button>
              <Button
                href={contact?.whatsappUrl || undefined}
                variant="bordered"
                className="w-full justify-between border-2 border-white/60 !bg-white/10 hover:!bg-white/20 text-white transition-all duration-300"
                disabled={!contact?.whatsappUrl}
              >
                <span className="flex items-center gap-3">
                  <MessageSquare size={20} />
                  <span className="font-semibold">{C.WHATSAPP}</span>
                </span>
                <span className="text-sm opacity-70">{C.WHATSAPP_SUB}</span>
              </Button>
              <Button
                href="/booking"
                variant="outlineWhite"
                className="w-full justify-between border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300"
                withArrow
              >
                <span className="flex items-center gap-3">
                  <Calendar size={20} />
                  <span className="font-semibold">{C.SCHEDULE_CALL}</span>
                </span>
                <span className="text-sm opacity-70">{C.SCHEDULE_SUB}</span>
              </Button>
            </div>
          </Card>
        </div>
      </Section>

      {/* Trust & Preparation Section */}
      <Section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="grid gap-8 lg:grid-cols-2 max-w-7xl mx-auto">
          <Card className="rounded-3xl border-2 border-primary-blue/20 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Shield className="text-primary-blue" size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-navy-blue">{C.TRUST_CARD_TITLE}</h3>
            </div>
            <IconList items={reassuranceHighlights} />
          </Card>

          <Card className="rounded-3xl border-2 border-primary-blue/20 shadow-card hover:shadow-card-hover transition-shadow duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-primary-blue/10">
                <Calendar className="text-primary-blue" size={24} />
              </div>
              <h3 className="text-2xl font-heading font-bold text-navy-blue">{C.PREP_CARD_TITLE}</h3>
            </div>
            <IconList
              items={[
                { text: C.PREP_1 },
                { text: C.PREP_2 },
                { text: C.PREP_3 },
                { text: C.PREP_4 },
              ]}
            />
          </Card>
        </div>
      </Section>

      <CTASection
        title={C.CTA_TITLE}
        subtitle={C.CTA_SUBTITLE}
        primaryCTA={{ text: C.CTA_PRIMARY, href: ROUTES.BLOG }}
        secondaryCTA={{ text: C.CTA_SECONDARY, href: '/' }}
        variant="default"
      />
    </div>
  );
}

