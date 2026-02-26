/**
 * Activity Card Component
 * 
 * Reusable card component for displaying activity summary.
 */

'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, Eye, Users } from 'lucide-react';
import { ActivityDTO } from '@/core/application/activities';

interface ActivityCardProps {
  activity: ActivityDTO;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Link href={`/activities/${activity.slug}`} className="group block">
      <article className="bg-white rounded-card border-2 border-primary-blue/20 shadow-card hover:shadow-card-hover transition-all duration-300 card-hover-lift md:hover:rotate-3 overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={activity.imageUrl}
            alt={activity.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
          {activity.category && (
            <div className="absolute top-4 left-4 bg-primary-blue/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold">
              {activity.category}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 flex flex-col">
          {/* Title */}
          <h3 className="text-xl font-heading font-bold text-navy-blue mb-3 group-hover:text-primary-blue transition-colors duration-300">
            {activity.name}
          </h3>

          {/* Description */}
          <p className="text-navy-blue/80 text-sm mb-4 line-clamp-2 flex-1">
            {activity.description}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-navy-blue/80 pt-4 border-t border-primary-blue/20">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{activity.duration} {activity.duration === 1 ? 'hour' : 'hours'}</span>
            </div>
            {activity.ageRange && (
              <div className="flex items-center gap-1">
                <Users size={14} />
                <span>{activity.ageRange}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Eye size={14} />
              <span>{activity.views} views</span>
            </div>
          </div>

          {/* Trainer Count */}
          {activity.trainerIds && activity.trainerIds.length > 0 && (
            <div className="mt-3 text-xs text-gray-600">
              {activity.trainerIds.length} {activity.trainerIds.length === 1 ? 'trainer' : 'trainers'} available
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}


