'use client';

import React from 'react';
import Image from 'next/image';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { Users, Award } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

export interface AboutMissionSectionProps {
  sectionTitle: string;
  description?: string | null;
}

export default function AboutMissionSection({ sectionTitle, description }: AboutMissionSectionProps) {
  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <Section title={sectionTitle} titleClassName="heading-text-shadow">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            {description ? (
              <p className="text-lg text-navy-blue mb-8 leading-relaxed whitespace-pre-wrap">{description}</p>
            ) : (
              <>
                <h2 className="text-4xl font-bold text-navy-blue mb-6 leading-tight">Specialist Support for Every Child</h2>
                <p className="text-lg text-navy-blue mb-6 leading-relaxed">
                  At CAMS Services, we are dedicated to providing specialist SEN support and trauma-informed care for children with a range of needs, including SEMH, ASD, and ADHD.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="text-white" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-navy-blue">EHCP Support</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-lg flex items-center justify-center flex-shrink-0">
                      <Award className="text-white" size={20} />
                    </div>
                    <span className="text-sm font-semibold text-navy-blue">Alternative Provision</span>
                  </div>
                </div>
                <p className="text-lg text-navy-blue mb-8 leading-relaxed">
                  Our mission is to empower young people with personalised mentoring and activities that build confidence, resilience, and essential life skills in a safe, nurturing environment.
                </p>
              </>
            )}
            <Button href={ROUTES.CONTACT} variant="bordered" size="lg" withArrow>
              Discuss Your Child&apos;s Needs
            </Button>
          </div>
          <div className="order-1 lg:order-2 relative w-full h-80 md:h-96 rounded-card shadow-xl overflow-hidden">
            <Image
              src="/images/hero/bg-space.webp"
              alt="Mission-focused mentoring session illustration"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              quality={90}
              priority
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
