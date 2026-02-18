/**
 * Service Detail Component
 * 
 * Displays a single service in detail.
 */

'use client';

import { useService } from '../../hooks/services/useService';

interface ServiceDetailProps {
  slug: string;
  incrementViews?: boolean;
}

export default function ServiceDetail({ slug, incrementViews = true }: ServiceDetailProps) {
  const { service, loading, error } = useService(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading service...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Service not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="prose lg:prose-xl mx-auto text-[#1E3A5F]">
        <p className="text-lg text-[#1E3A5F] mb-6">
          At CAMS Services, we believe in providing comprehensive and compassionate support tailored to each child&apos;s unique needs. Our approach to {service.title.toLowerCase()} is built on principles of understanding, empowerment, and positive development.
        </p>
        {/* Additional content can be added based on service slug */}
      </div>
    </div>
  );
}


