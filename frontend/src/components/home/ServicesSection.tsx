'use client';

import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { ServiceSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { DEFAULT_HOME_STRINGS } from '@/components/home/constants';
import type { ServiceDTO } from '@/core/application/services';
import { Heart } from 'lucide-react';

export interface ServicesSectionConfig {
  title: string;
  subtitle?: string;
  viewAllLabel: string;
  viewAllHref: string;
}

export interface ServicesSectionProps {
  config: ServicesSectionConfig;
  services: ServiceDTO[];
  isLoading: boolean;
  error: Error | null;
}

export function ServicesSection({ config, services, isLoading, error }: ServicesSectionProps) {
  const showSkeleton = isLoading && services.length === 0;
  const showEmpty = !showSkeleton && services.length === 0;
  const hasData = services.length > 0;

  return (
    <Section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{config.subtitle}</p>
          )}
        </div>

        {showSkeleton && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <ServiceSkeleton count={SKELETON_COUNTS.SERVICES} />
            {error && (
              <div className="col-span-full text-center text-sm text-gray-500">
                {error.message || DEFAULT_HOME_STRINGS.SERVICES_LOAD_ERROR}
              </div>
            )}
          </div>
        )}

        {hasData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {services.map((service) => {
              const iconKey = service.icon?.toLowerCase() ?? 'heart';
              const Icon = ICON_COMPONENT_MAP[iconKey] ?? Heart;
              return (
                <div
                  key={service.slug}
                  className="group relative bg-white rounded-card overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border-2 border-gray-200 card-hover-lift hover:rotate-1"
                >
                  <div className="relative h-48 bg-gradient-to-br from-primary-blue to-light-blue-cyan overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-blue/70 to-light-blue-cyan/70 flex items-center justify-center">
                      <Icon className="text-white opacity-40" size={100} />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent" />
                  </div>
                  <div className="relative z-10 p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-light-blue-cyan rounded-xl flex items-center justify-center shadow-lg">
                        <Icon className="text-white" size={24} />
                      </div>
                      <h3 className="text-2xl font-bold text-navy-blue group-hover:text-primary-blue transition-colors duration-300">
                        {service.title}
                      </h3>
                    </div>
                    <p className="text-gray-700 text-base leading-relaxed mb-4">{service.description}</p>
                    <Button
                      href={`/services/${service.slug}`}
                      variant="bordered"
                      size="sm"
                      withArrow
                      className="group-hover:bg-primary-blue group-hover:text-white group-hover:border-primary-blue"
                    >
                      Learn More
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showEmpty && (
          <div className="text-center py-12 text-gray-600">
            <p>{DEFAULT_HOME_STRINGS.SERVICES_EMPTY_MESSAGE}</p>
          </div>
        )}

        <div className="text-center">
          <Button href={config.viewAllHref} variant="secondary" size="lg" withArrow>
            {config.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );
}
