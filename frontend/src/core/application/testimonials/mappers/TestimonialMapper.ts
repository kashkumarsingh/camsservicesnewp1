/**
 * Testimonial Mapper
 *
 * Converts domain entities ↔ DTOs.
 */

import { Testimonial } from '@/core/domain/testimonials';
import { TestimonialDTO } from '../dto/TestimonialDTO';

export class TestimonialMapper {
  static toDTO(testimonial: Testimonial): TestimonialDTO {
    return {
      id: testimonial.id,
      publicId: testimonial.publicId,
      slug: testimonial.slug,
      authorName: testimonial.authorName,
      authorRole: testimonial.authorRole,
      authorAvatarUrl: testimonial.authorAvatarUrl ?? undefined,
      quote: testimonial.quote,
      rating: testimonial.rating ?? undefined,
      sourceType: testimonial.sourceType,
      sourceLabel: testimonial.sourceLabel ?? undefined,
      sourceUrl: testimonial.sourceUrl ?? undefined,
      locale: testimonial.locale,
      isFeatured: testimonial.isFeatured,
      badges: testimonial.badges,
      externalReviewId: testimonial.externalReviewId ?? undefined,
      createdAt: testimonial.createdAt.toISOString(),
      updatedAt: testimonial.updatedAt.toISOString(),
    };
  }

  static toDTOs(testimonials: Testimonial[]): TestimonialDTO[] {
    return testimonials.map(TestimonialMapper.toDTO);
  }
}


