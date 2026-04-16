/**
 * Testimonial fallback mapping for public pages.
 * Maps static fallback data (e.g. from commonData) to TestimonialDTO shape.
 * Also maps external review aggregate items (Google/Trustpilot) to TestimonialDTO.
 */

import type { TestimonialDTO } from '@/core/application/testimonials';
import type { TestimonialSourceType } from '@/core/domain/testimonials';
import type { ExternalReviewAggregateItem } from '@/interfaces/web/hooks/reviews/useReviewAggregate';

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

/**
 * Maps a single external review from the aggregate endpoint to TestimonialDTO.
 * Used when filling the home page testimonials section from Google/Trustpilot reviews.
 */
export function mapExternalReviewAggregateToTestimonialDTO(
  item: ExternalReviewAggregateItem
): TestimonialDTO {
  const sourceType: TestimonialSourceType =
    item.provider === 'google' || item.provider === 'trustpilot'
      ? item.provider
      : 'other';
  return {
    id: item.id,
    publicId: item.id,
    slug: item.id,
    authorName: item.authorName ?? '',
    authorRole: null,
    authorAvatarUrl: item.authorAvatarUrl ?? null,
    quote: item.content ?? '',
    rating: item.rating ?? null,
    sourceType,
    sourceLabel: item.providerDisplayName ?? item.provider ?? null,
    sourceUrl: item.permalink ?? null,
    locale: 'en-GB',
    isFeatured: false,
    badges: [],
  };
}
