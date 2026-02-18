/**
 * Testimonial DTO
 *
 * Data transfer object exposed to UI layers.
 */

import { TestimonialBadge, TestimonialSourceType } from '@/core/domain/testimonials';

export interface TestimonialDTO {
  id: string;
  publicId: string;
  slug: string;
  authorName: string;
  authorRole?: string | null;
  authorAvatarUrl?: string | null;
  quote: string;
  rating?: number | null;
  sourceType: TestimonialSourceType;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  locale: string;
  isFeatured: boolean;
  badges: TestimonialBadge[];
  externalReviewId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}


