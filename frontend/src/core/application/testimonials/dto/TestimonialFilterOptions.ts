/**
 * Testimonial filter options passed to use cases.
 */

import { TestimonialSourceType } from '@/core/domain/testimonials';

export interface TestimonialFilterOptions {
  featured?: boolean;
  limit?: number;
  sourceTypes?: TestimonialSourceType[];
  locale?: string;
}


