'use client';

import Section from '@/components/layout/Section';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { Sparkles } from 'lucide-react';

export interface HowItWorksStep {
  title: string;
  description?: string;
  icon?: string;
}

export interface HowItWorksSectionConfig {
  title: string;
  subtitle?: string;
  steps: HowItWorksStep[];
}

export interface HowItWorksSectionProps {
  config: HowItWorksSectionConfig;
}

export function HowItWorksSection({ config }: HowItWorksSectionProps) {
  if (!config.steps?.length) {
    return null;
  }

  return (
    <Section id="how-it-works" className="py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{config.subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {config.steps.map((step, index) => {
            const iconKey = step.icon?.toLowerCase() ?? 'sparkles';
            const Icon = ICON_COMPONENT_MAP[iconKey] ?? Sparkles;
            return (
              <div
                key={`${step.title}-${index}`}
                className="relative bg-white rounded-card overflow-hidden shadow-md hover:shadow-2xl card-hover-lift transition-all duration-300 border-2 border-gray-200 md:hover:rotate-3 group"
              >
                <div className="relative h-48 bg-gradient-to-br from-primary-blue to-light-blue-cyan overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/80 to-light-blue-cyan/80 flex items-center justify-center">
                    <Icon className="text-white opacity-30" size={80} />
                  </div>
                  <div className="absolute top-4 left-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-primary-blue font-bold text-xl shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl font-bold text-navy-blue mb-3 group-hover:text-primary-blue transition-colors duration-300">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-gray-700 leading-relaxed">{step.description}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
