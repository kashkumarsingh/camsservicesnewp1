import { ITestimonialRepository } from '@/core/application/testimonials';
import { ApiTestimonialRepository } from './ApiTestimonialRepository';
import { StaticTestimonialRepository } from './StaticTestimonialRepository';

export type TestimonialRepositoryType = 'api' | 'static';

export function createTestimonialRepository(type?: TestimonialRepositoryType): ITestimonialRepository {
  const repoType = type || (process.env.NEXT_PUBLIC_TESTIMONIAL_REPOSITORY as TestimonialRepositoryType) || 'api';

  switch (repoType) {
    case 'static':
      return new StaticTestimonialRepository();
    case 'api':
    default:
      return new ApiTestimonialRepository();
  }
}

export const testimonialRepository = createTestimonialRepository();


