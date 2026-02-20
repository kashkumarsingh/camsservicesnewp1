/**
 * Testimonial fallback mapping for public pages.
 * Maps static fallback data (e.g. from commonData) to TestimonialDTO shape.
 */

import type { TestimonialDTO } from '@/core/application/testimonials';

export type FallbackTestimonialItem = {
  name: string;
  role: string;
  rating: number;
  avatar: string;
  text: string;
};

/**
 * Maps an array of fallback testimonial items to TestimonialDTO[].
 * Used when remote testimonials are empty or failed — never define this mapping inline per page.
 */
export function mapFallbackTestimonials(
  data: FallbackTestimonialItem[]
): TestimonialDTO[] {
  return data.map((testimonial, index) => ({
    id: `fallback-${index}`,
    publicId: `fallback-${index}`,
    slug: `fallback-${index}`,
    authorName: testimonial.name,
    authorRole: testimonial.role,
    authorAvatarUrl: testimonial.avatar,
    quote: testimonial.text,
    rating: testimonial.rating,
    sourceType: 'manual' as const,
    sourceLabel: 'CAMS Services',
    sourceUrl: undefined,
    locale: 'en-GB',
    isFeatured: true,
    badges: [],
  }));
}
