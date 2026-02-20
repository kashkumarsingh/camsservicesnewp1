'use client';

import React from 'react';
import Image from 'next/image';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { CheckCircle2 } from 'lucide-react';
import { ROUTES } from '@/utils/routes';

const DEFAULT_BADGES = ['DBS Checked', 'First-Aid Certified', 'Safeguarding Trained', 'Risk Assessed'];

/**
 * About page–specific: Safeguarding section.
 * Editable from Admin → Public Pages → About (title, subtitle, description, badges).
 */
export interface AboutSafeguardingSectionProps {
  title: string;
  subtitle: string;
  description: string;
  badges?: string[];
}

export default function AboutSafeguardingSection({
  title,
  subtitle,
  description,
  badges = DEFAULT_BADGES,
}: AboutSafeguardingSectionProps) {
  const badgeList = badges.length > 0 ? badges : DEFAULT_BADGES;

  return (
    <div className="py-20 bg-gradient-to-br from-blue-50 to-white">
      <Section title={title} subtitle={subtitle} titleClassName="heading-text-shadow">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-80 md:h-96 rounded-card shadow-xl overflow-hidden">
            <Image
              src="/images/team/trainner-1.webp"
              alt="Safeguarding-focused CAMS Services mentor"
              fill
              className="object-cover"
              quality={90}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-lg text-navy-blue mb-6 leading-relaxed">{description}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {badgeList.map((label, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-100"
                >
                  <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
                  <span className="text-sm font-semibold text-navy-blue">{label}</span>
                </div>
              ))}
            </div>
            <p className="text-lg text-navy-blue mb-8 leading-relaxed">
              We conduct rigorous risk assessments for all activities and create personalised care plans to ensure a
              secure and supportive environment for every child.
            </p>
            <Button href={ROUTES.CONTACT} variant="bordered" size="lg" withArrow>
              Request Our Safeguarding Policy
            </Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
