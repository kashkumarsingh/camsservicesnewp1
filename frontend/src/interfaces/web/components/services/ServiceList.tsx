/**
 * Service List Component
 * 
 * Displays a list of services.
 */

'use client';

import { useServices } from '../../hooks/services/useServices';
import ServiceCard from './ServiceCard';
import { ServiceFilterOptions } from '@/core/application/services';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import { ServiceSkeleton } from '@/components/ui/Skeleton';
import { EMPTY_STATE } from '@/utils/emptyStateConstants';

interface ServiceListProps {
  filterOptions?: ServiceFilterOptions;
}

export default function ServiceList({ filterOptions }: ServiceListProps) {
  const { services, loading, error } = useServices(filterOptions);

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ServiceSkeleton count={SKELETON_COUNTS.SERVICES} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-sm text-gray-600">{EMPTY_STATE.NO_SERVICES_FOUND.title}</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </div>
  );
}


