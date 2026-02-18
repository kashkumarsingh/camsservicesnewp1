import { TestimonialMapper } from '../mappers/TestimonialMapper';
import { TestimonialDTO } from '../dto/TestimonialDTO';
import { ITestimonialRepository } from '../ports/ITestimonialRepository';

/**
 * GetTestimonialUseCase
 */
export class GetTestimonialUseCase {
  constructor(private readonly testimonialRepository: ITestimonialRepository) {}

  async execute(identifier: string): Promise<TestimonialDTO | null> {
    const testimonial = await this.testimonialRepository.findByIdentifier(identifier);
    return testimonial ? TestimonialMapper.toDTO(testimonial) : null;
  }
}


