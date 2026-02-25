/**
 * Service Card Component
 * 
 * Reusable card component for displaying service summary.
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { ServiceDTO } from '@/core/application/services';
import { Heart, Users, Shield, ArrowRight } from 'lucide-react';
import { SERVICES_PAGE } from '@/app/(public)/constants/servicesPageConstants';

interface ServiceCardProps {
  service: ServiceDTO;
}

const iconMap: Record<string, typeof Heart> = {
  Heart,
  Users,
  Shield,
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const IconComponent = service.icon && iconMap[service.icon] ? iconMap[service.icon] : Shield;

  return (
    <div className="flex flex-col rounded-card border-2 border-gray-200 bg-white shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl card-hover-lift group">
      <div className="relative h-32 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-blue to-light-blue-cyan" aria-hidden />
        <IconComponent className="text-white relative z-10" size={48} />
      </div>
      <div className="p-6 sm:p-8 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-navy-blue mb-3">
          {service.title}
        </h3>
        <p className="text-gray-600 text-base leading-relaxed mb-6 flex-grow">
          {service.description}
        </p>
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex items-center gap-1.5 text-primary-blue font-semibold text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-primary-blue focus:ring-offset-2 rounded"
        >
          {SERVICES_PAGE.LEARN_MORE}
          <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </div>
  );
}

