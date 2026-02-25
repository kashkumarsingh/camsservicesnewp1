'use client';

import Link from 'next/link';
import Section from '@/components/layout/Section';
import Button from '@/components/ui/Button';
import { ServiceSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { ICON_COMPONENT_MAP } from '@/utils/iconMap';
import { DEFAULT_HOME_STRINGS, SERVICE_CARD_GRADIENTS } from '@/components/home/constants';
import type { ServiceDTO } from '@/core/application/services';
import { Heart, ArrowRight } from 'lucide-react';

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
    <Section className="py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{config.subtitle}</p>
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
            {services.map((service, index) => {
              const iconKey = service.icon?.toLowerCase() ?? 'heart';
              const Icon = ICON_COMPONENT_MAP[iconKey] ?? Heart;
              const gradient = SERVICE_CARD_GRADIENTS[index % SERVICE_CARD_GRADIENTS.length];
              return (
                <div
                  key={service.slug}
                  className="rounded-card border border-gray-200 card-hover-lift transition-all duration-300 flex flex-col bg-white shadow-card overflow-hidden md:hover:rotate-3 group"
                >
                  <div className="relative h-32 flex items-center justify-center">
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-opacity duration-300 group-hover:opacity-95`} aria-hidden />
                    <Icon className="text-white relative z-10 drop-shadow-md transition-transform duration-300 group-hover:scale-110" size={48} />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-navy-blue mb-3">
                      {service.title}
                    </h3>
                    <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">{service.description}</p>
                    <Link
                      href={`/services/${service.slug}`}
                      className="inline-flex items-center gap-1.5 text-primary-blue font-semibold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded group/link"
                    >
                      {DEFAULT_HOME_STRINGS.SERVICES_LEARN_MORE}
                      <ArrowRight size={16} className="text-primary-blue transition-transform duration-200 group-hover/link:translate-x-0.5" aria-hidden />
                    </Link>
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
          <Button href={config.viewAllHref} variant="primary" size="lg" className="rounded-full hover:shadow-2xl hover:scale-105 transition-all duration-300" withArrow>
            {config.viewAllLabel}
          </Button>
        </div>
      </div>
    </Section>
  );
}
