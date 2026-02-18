/**
 * Get FAQ Item Use Case
 * 
 * Orchestrates getting a single FAQ item by ID or slug.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { IFAQRepository } from '../ports/IFAQRepository';
import { FAQMapper } from '../mappers/FAQMapper';
import { FAQItemDTO } from '../dto/FAQItemDTO';

export class GetFAQItemUseCase {
  constructor(private readonly faqRepository: IFAQRepository) {}

  async execute(idOrSlug: string): Promise<FAQItemDTO | null> {
    // Try to find by ID first
    let faq = await this.faqRepository.findById(idOrSlug);

    // If not found, try by slug
    if (!faq) {
      faq = await this.faqRepository.findBySlug(idOrSlug);
    }

    if (!faq) {
      return null;
    }

    return FAQMapper.toDTO(faq);
  }
}


