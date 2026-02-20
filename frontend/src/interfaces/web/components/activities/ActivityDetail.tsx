/**
 * Activity Detail Component
 * 
 * Displays a single activity in detail.
 */

'use client';

import { useActivity } from '../../hooks/activities/useActivity';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Users, ArrowLeft } from 'lucide-react';

interface ActivityDetailProps {
  slug: string;
  incrementViews?: boolean;
}

export default function ActivityDetail({ slug, incrementViews = true }: ActivityDetailProps) {
  const { activity, loading, error } = useActivity(slug, incrementViews);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading activity...</p>
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

  if (!activity) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Activity not found.</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link 
        href="/activities" 
        className="inline-flex items-center gap-2 text-navy-blue/80 hover:text-primary-blue mb-6 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Activities
      </Link>

      {/* Header */}
      <header className="mb-8">
        {activity.category && (
          <div className="inline-block bg-primary-blue/10 text-primary-blue px-4 py-2 rounded-full text-sm font-semibold mb-4">
            {activity.category}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-heading font-bold text-navy-blue mb-4">
          {activity.name}
        </h1>

        {/* Meta Information */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Clock size={18} />
            <span>{activity.duration} {activity.duration === 1 ? 'hour' : 'hours'}</span>
          </div>
          {activity.ageRange && (
            <div className="flex items-center gap-2">
              <Users size={18} />
              <span>Ages: {activity.ageRange}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Eye size={18} />
            <span>{activity.views} views</span>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="relative w-full h-96 mb-8 rounded-2xl overflow-hidden">
        <Image
          src={activity.imageUrl}
          alt={activity.name}
          fill
          className="object-cover"
        />
      </div>

      {/* Description */}
      <div className="prose prose-lg max-w-none mb-8">
        <p className="text-lg text-gray-700 leading-relaxed">{activity.description}</p>
      </div>

      {/* Trainer Information */}
      {activity.trainerIds && activity.trainerIds.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold text-navy-blue mb-4">Available Trainers</h3>
          <p className="text-gray-700">
            This activity is led by {activity.trainerIds.length} {activity.trainerIds.length === 1 ? 'qualified trainer' : 'qualified trainers'}.
            {activity.trainers && activity.trainers.length > 0 && (
              <span className="block mt-2">
                Trainers: {activity.trainers.map(t => t.name).join(', ')}
              </span>
            )}
          </p>
        </div>
      )}
    </article>
  );
}


