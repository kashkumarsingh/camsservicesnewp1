import { TestimonialMapper } from '../mappers/TestimonialMapper';
import { TestimonialDTO } from '../dto/TestimonialDTO';
import { TestimonialFilterOptions } from '../dto/TestimonialFilterOptions';
import { ITestimonialRepository } from '../ports/ITestimonialRepository';

/**
 * ListTestimonialsUseCase
 *
 * Fetches testimonials from repository and returns DTOs.
 */
export class ListTestimonialsUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(filters?: TestimonialFilterOptions): Promise<TestimonialDTO[]> {
    const testimonials = await this.testimonialRepository.findAll(filters);
    return TestimonialMapper.toDTOs(testimonials);
  }
}


