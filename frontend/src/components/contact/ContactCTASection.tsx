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
    <Section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900 mb-2">{CONTACT_CTA.TITLE}</h2>
        <p className="text-sm text-slate-600 mb-6">{CONTACT_CTA.SUBTITLE}</p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <Button href="#contact-form" variant="primary" size="lg" withArrow>
            {CONTACT_CTA.CTA_PRIMARY}
          </Button>
          <Button
            href={phoneHref ?? undefined}
            variant="outline"
            size="lg"
            disabled={phoneDisabled}
          >
            <Phone size={18} className="mr-2" />
            {phoneDisabled ? callLabel : CONTACT_CTA.CTA_CALL}
          </Button>
        </div>
        <p className="mt-6 text-sm text-slate-500">{CONTACT_CTA.FOOTER}</p>
      </div>
    </Section>
  );
}
