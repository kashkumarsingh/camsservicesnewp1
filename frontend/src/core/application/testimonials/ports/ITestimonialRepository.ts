/**
 * Testimonial Repository Port
 *
 * Application layer depends on this abstraction.
 */

import { Testimonial } from '@/core/domain/testimonials';
import { TestimonialFilterOptions } from '../dto/TestimonialFilterOptions';

export interface ITestimonialRepository {
  findAll(filters?: TestimonialFilterOptions): Promise<Testimonial[]>;
  findByIdentifier(identifier: string): Promise<Testimonial | null>;
}


