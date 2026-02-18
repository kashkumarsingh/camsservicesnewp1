/**
 * Static Testimonial Repository
 *
 * Provides fallback data sourced from static files.
 */

import { testimonials as staticTestimonials } from '@/data/commonData';
import { Testimonial } from '@/core/domain/testimonials';
import { ITestimonialRepository, TestimonialFilterOptions } from '@/core/application/testimonials';

export class StaticTestimonialRepository implements ITestimonialRepository {
  private domainTestimonials: Testimonial[];

  constructor() {
    this.domainTestimonials = staticTestimonials.map((testimonial, index) =>
      Testimonial.create({
        id: String(index + 1),
        publicId: `static-${index + 1}`,
        slug: `static-${index + 1}`,
        authorName: testimonial.name,
        authorRole: testimonial.role,
        authorAvatarUrl: testimonial.avatar,
        quote: testimonial.text,
        rating: testimonial.rating,
        sourceType: 'manual',
        sourceLabel: 'CAMS Services',
        sourceUrl: null,
        locale: 'en-GB',
        isFeatured: true,
        badges: [],
        metadata: null,
      })
    );
  }

  async findAll(filters?: TestimonialFilterOptions): Promise<Testimonial[]> {
    let results = [...this.domainTestimonials];

    if (filters?.featured !== undefined) {
      results = results.filter((testimonial) => testimonial.isFeatured === filters.featured);
    }

    if (filters?.limit) {
      results = results.slice(0, filters.limit);
    }

    return results;
  }

  async findByIdentifier(identifier: string): Promise<Testimonial | null> {
    return (
      this.domainTestimonials.find(
        (testimonial) =>
          testimonial.id === identifier ||
          testimonial.publicId === identifier ||
          testimonial.slug === identifier
      ) ?? null
    );
  }
}


