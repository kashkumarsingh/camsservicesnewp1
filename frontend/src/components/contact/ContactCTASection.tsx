'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { Phone } from 'lucide-react';
import { CONTACT_CTA } from './constants';

interface ContactCTASectionProps {
  phoneHref: string | null;
  phoneDisabled: boolean;
  callLabel?: string;
}

export default function ContactCTASection({
  phoneHref,
  phoneDisabled,
  callLabel = CONTACT_CTA.PHONE_COMING_SOON,
}: ContactCTASectionProps) {
  return (
    <Section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-navy-blue to-primary-blue z-0" />
      <div className="absolute inset-0 z-10 opacity-10" style={{ backgroundImage: "url('/svgs/star.svg')", backgroundRepeat: 'repeat', backgroundSize: '40px 40px' }} />
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3">{CONTACT_CTA.TITLE}</h2>
        <p className="text-lg text-white/90 mb-8">{CONTACT_CTA.SUBTITLE}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button href="#contact-form" variant="superPlayful" size="lg" className="rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
            {CONTACT_CTA.CTA_PRIMARY}
          </Button>
          <Button
            href={phoneHref ?? undefined}
            variant="outline"
            size="lg"
            className="rounded-full bg-white text-primary-blue border-2 border-white shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
            disabled={phoneDisabled}
          >
            <Phone size={18} className="mr-2" />
            {phoneDisabled ? callLabel : CONTACT_CTA.CTA_CALL}
          </Button>
        </div>
        <p className="mt-8 text-sm text-white/80">{CONTACT_CTA.FOOTER}</p>
      </div>
    </Section>
  );
}
