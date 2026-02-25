'use client';

import React from 'react';
import Section from '@/components/layout/Section';
import { Heart, Shield, Sprout } from 'lucide-react';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement> & { size?: number }>;

const ICON_MAP: Record<string, IconComponent> = {
  heart: Heart,
  shield: Shield,
  sprout: Sprout,
};

function getIcon(name?: string): IconComponent {
  if (!name) return Heart;
  return ICON_MAP[name.toLowerCase().trim()] ?? Heart;
}

const GRADIENTS = ['from-primary-blue to-light-blue-cyan', 'from-galaxy-purple to-primary-blue', 'from-orbital-green to-star-gold'];

export interface CoreValueItem {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutCoreValuesSectionProps {
  sectionTitle: string;
  sectionSubtitle: string;
  values: CoreValueItem[];
}

const DEFAULT_VALUES: CoreValueItem[] = [
  { icon: 'heart', title: 'Compassionate Care', description: 'We approach every child with empathy and a deep understanding of their unique journey, ensuring they feel valued and heard.' },
  { icon: 'shield', title: 'Safety First', description: 'We provide a secure and reliable environment, adhering to the highest standards of safeguarding and child protection in the UK.' },
  { icon: 'sprout', title: 'Fostering Growth', description: 'We are committed to fostering personal growth, emotional resilience, and positive pathways for every young person we mentor.' },
];

export default function AboutCoreValuesSection({ sectionTitle, sectionSubtitle, values }: AboutCoreValuesSectionProps) {
  const items = values.length >= 3 ? values.slice(0, 3) : DEFAULT_VALUES;

  return (
    <div className="py-20 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <Section title={sectionTitle} subtitle={sectionSubtitle} titleClassName="heading-text-shadow">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 text-center">
          {items.map((val, i) => {
            const IconComponent = getIcon(val.icon);
            return (
              <div key={i} className="p-6 sm:p-8 rounded-card border-2 border-gray-200 bg-white shadow-card hover:shadow-card-hover card-hover-lift transition-all duration-300 flex flex-col justify-between md:hover:rotate-3 group">
                <div>
                  <div className={`relative w-20 h-20 bg-gradient-to-br ${GRADIENTS[i]} rounded-full flex items-center justify-center mb-5 mx-auto shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="text-white" size={36} />
                  </div>
                  <h3 className="text-2xl font-bold text-navy-blue mb-3 group-hover:text-primary-blue transition-colors">{val.title}</h3>
                  <p className="text-navy-blue leading-relaxed">{val.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
