'use client';

import Section from '@/components/layout/Section';
import { TestimonialSkeleton } from '@/components/ui/Skeleton';
import { SKELETON_COUNTS } from '@/utils/skeletonConstants';
import Image from 'next/image';
import { Star } from 'lucide-react';
import type { TestimonialDTO } from '@/core/application/testimonials';

export interface TestimonialsSectionConfig {
  title: string;
  subtitle?: string;
  limit: number;
}

export interface TestimonialsSectionProps {
  config: TestimonialsSectionConfig;
  testimonials: TestimonialDTO[];
  isLoading: boolean;
  error: Error | null;
}

const DEFAULT_AUTHOR_ROLE = 'CAMS Family';

export function TestimonialsSection({ config, testimonials, isLoading, error }: TestimonialsSectionProps) {
  const count = Math.min(config.limit, SKELETON_COUNTS.TESTIMONIALS);

  return (
    <Section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-navy-blue mb-3">{config.title}</h2>
          {config.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{config.subtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {isLoading ? (
            <TestimonialSkeleton count={count} />
          ) : (
            testimonials.map((testimonial) => {
              const ratingValue = Math.round(testimonial.rating ?? 5);
              const initials = testimonial.authorName.charAt(0).toUpperCase();

              return (
                <div
                  key={testimonial.id}
                  className="relative flex flex-col p-6 sm:p-8 rounded-card border border-gray-200 card-hover-lift transition-all duration-300 bg-white shadow-card h-full md:hover:rotate-3 group"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={i < ratingValue ? 'fill-star-gold text-star-gold' : 'text-gray-200'}
                        size={16}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 text-sm sm:text-base md:text-lg leading-relaxed italic flex-grow">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center mt-4">
                    {testimonial.authorAvatarUrl ? (
                      <Image
                        src={testimonial.authorAvatarUrl}
                        alt={testimonial.authorName}
                        width={56}
                        height={56}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary-blue to-light-blue-cyan flex items-center justify-center text-white font-bold text-lg sm:text-xl mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {initials}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-navy-blue text-sm sm:text-base md:text-lg">
                        {testimonial.authorName}
                      </div>
                      <div className="text-gray-600 text-xs sm:text-sm md:text-base">
                        {testimonial.authorRole ?? DEFAULT_AUTHOR_ROLE}
                      </div>
                      {testimonial.sourceLabel && (
                        <div className="text-xs text-gray-600 mt-1">{testimonial.sourceLabel}</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {error && <p className="text-center text-sm text-red-600 mt-6">{error.message}</p>}
      </div>
    </Section>
  );
}
