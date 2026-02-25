'use client';

import Section from '@/components/layout/Section';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { IMPACT_ICON_COLORS } from '@/components/home/constants';
import { Star } from 'lucide-react';

export interface ImpactStatsSectionConfig {
  title: string;
  subtitle?: string;
}

export interface ImpactStat {
  label: string;
  value: string;
  icon?: string;
}

export interface ImpactStatsSectionProps {
  config: ImpactStatsSectionConfig;
  stats: ImpactStat[];
}

export function ImpactStatsSection({ config, stats }: ImpactStatsSectionProps) {
  if (!stats?.length) return null;

  return (
    <Section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && <p className="text-lg text-gray-600 max-w-2xl mx-auto">{config.subtitle}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const iconKey = stat.icon?.toLowerCase() ?? 'star';
            const Icon = ICON_COMPONENT_MAP[iconKey] ?? Star;
            const iconColor = IMPACT_ICON_COLORS[index % IMPACT_ICON_COLORS.length];
            return (
              <div
                key={stat.label}
                className="p-4 sm:p-6 md:p-8 rounded-card border-2 border-gray-200 card-hover-lift transition-all duration-300 flex flex-col justify-between bg-gradient-to-br from-blue-50 to-purple-50 shadow-card hover:shadow-card-hover md:hover:rotate-3 group text-center"
              >
                <Icon className={`${iconColor} mx-auto mb-3 sm:mb-4 transition-transform duration-300 group-hover:scale-110`} size={32} />
                <div className="text-3xl sm:text-4xl font-bold text-navy-blue mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-semibold text-sm sm:text-base">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
