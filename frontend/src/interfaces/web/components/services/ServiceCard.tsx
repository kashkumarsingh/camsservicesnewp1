/**
 * Service Card Component
 * 
 * Reusable card component for displaying service summary.
 */

'use client';

import React from 'react';
import Button from '@/components/ui/Button';
import { ServiceDTO } from '@/core/application/services';
import { Heart, Users, Shield } from 'lucide-react';

interface ServiceCardProps {
  service: ServiceDTO;
}

// Icon mapping for services
const iconMap: Record<string, typeof Heart> = {
  'Heart': Heart,
  'Users': Users,
  'Shield': Shield,
};

export default function ServiceCard({ service }: ServiceCardProps) {
  // Get icon component from service icon name
  const IconComponent = service.icon && iconMap[service.icon] ? iconMap[service.icon] : Shield;

  return (
    <div className="flex flex-col rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div>
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/5">
          <IconComponent className="h-5 w-5 text-slate-700" size={20} />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-2">
          {service.title}
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          {service.description}
        </p>
      </div>
      <Button
        href={`/services/${service.slug}`}
        variant="bordered"
        size="sm"
        className="mt-auto self-start"
        withArrow
      >
        View service
      </Button>
    </div>
  );
}

