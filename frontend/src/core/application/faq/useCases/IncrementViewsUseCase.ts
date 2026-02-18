/**
 * Increment Views Use Case
 * 
 * Orchestrates incrementing the view count for a FAQ item.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { IFAQRepository } from '../ports/IFAQRepository';
import { FAQMapper } from '../mappers/FAQMapper';
import { FAQItemDTO } from '../dto/FAQItemDTO';

export class IncrementViewsUseCase {
  constructor(private readonly faqRepository: IFAQRepository) {}

  async execute(idOrSlug: string): Promise<FAQItemDTO | null> {
    // Find FAQ item
    let faq = await this.faqRepository.findById(idOrSlug);
    if (!faq) {
      faq = await this.faqRepository.findBySlug(idOrSlug);
    }

    if (!faq) {
      return null;
    }

    // Increment views
    faq.incrementViews();

    // Save updated FAQ
    await this.faqRepository.save(faq);

    return FAQMapper.toDTO(faq);
  }
}


