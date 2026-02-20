'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { Phone, Award, Shield, Star } from 'lucide-react';
import { CONTACT_HERO } from './constants';

interface ContactHeroSectionProps {
  phoneHref: string | null;
  phoneDisabled: boolean;
  callLabel?: string;
}

export default function ContactHeroSection(props: ContactHeroSectionProps) {
  const {
    phoneHref,
    phoneDisabled,
    callLabel = CONTACT_HERO.CTA_NUMBER_COMING_SOON,
  } = props;
  return (
    <Section className="border-b border-slate-200 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
          {CONTACT_HERO.TITLE}
        </h1>
        <p className="mt-4 text-base md:text-lg text-slate-600 max-w-2xl mx-auto">
          {CONTACT_HERO.SUBTITLE}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs font-medium uppercase tracking-wider text-slate-600">
          <span className="flex items-center gap-1.5">
            <Star className="h-4 w-4 text-slate-500 fill-slate-500 shrink-0" />
            {CONTACT_HERO.BADGE_RATING}
          </span>
          <span className="flex items-center gap-1.5">
            <Shield className="h-4 w-4 text-slate-500 shrink-0" size={16} />
            {CONTACT_HERO.BADGE_DBS}
          </span>
          <span className="flex items-center gap-1.5">
            <Award className="h-4 w-4 text-slate-500 shrink-0" size={16} />
            {CONTACT_HERO.BADGE_OFSTED}
          </span>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Button href="#contact-form" variant="primary" size="lg" withArrow>
            {CONTACT_HERO.CTA_PRIMARY}
          </Button>
          <Button
            href={phoneHref ?? undefined}
            variant="outline"
            size="lg"
            withArrow
            disabled={phoneDisabled}
          >
            <Phone size={18} className="mr-2" />
            {phoneDisabled ? callLabel : CONTACT_HERO.CTA_CALL}
          </Button>
        </div>
      </div>
    </Section>
  );
}
