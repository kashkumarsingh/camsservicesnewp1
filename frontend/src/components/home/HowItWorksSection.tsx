'use client';

import Section from '@/components/layout/Section';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { Sparkles } from 'lucide-react';
import { HOW_IT_WORKS_GRADIENTS, HOW_IT_WORKS_BADGE_CLASSES } from '@/components/home/constants';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{config.subtitle}</p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {config.steps.map((step, index) => {
            const iconKey = step.icon?.toLowerCase() ?? 'sparkles';
            const Icon = ICON_COMPONENT_MAP[iconKey] ?? Sparkles;
            const gradient = HOW_IT_WORKS_GRADIENTS[index % HOW_IT_WORKS_GRADIENTS.length];
            const stepBadge = HOW_IT_WORKS_BADGE_CLASSES[index % HOW_IT_WORKS_BADGE_CLASSES.length];
            return (
              <div
                key={`${step.title}-${index}`}
                className="rounded-card border border-gray-200 card-hover-lift transition-all duration-300 flex flex-col bg-white shadow-card overflow-hidden md:hover:rotate-3 group"
              >
                <div className="relative h-32 flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center transition-opacity duration-300 group-hover:opacity-95`} aria-hidden />
                  <span className={`absolute top-3 left-3 z-10 w-8 h-8 rounded-full ${stepBadge} flex items-center justify-center text-sm font-bold shadow-sm`}>
                    {index + 1}
                  </span>
                  <Icon className="text-white relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110" size={48} />
                </div>
                <div className="p-6 sm:p-8 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-navy-blue mb-3">
                    {step.title}
                  </h3>
                  {step.description && (
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
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
