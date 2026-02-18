/**
 * Create FAQ Item Use Case
 * 
 * Orchestrates creating a new FAQ item.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { IFAQRepository } from '../ports/IFAQRepository';
import { FAQItemFactory } from '../factories/FAQItemFactory';
import { FAQMapper } from '../mappers/FAQMapper';
import { CreateFAQItemDTO } from '../dto/CreateFAQItemDTO';
import { FAQItemDTO } from '../dto/FAQItemDTO';
import { FAQItemCreatedEvent } from '../../../domain/faq/events/FAQItemCreatedEvent';

export class CreateFAQItemUseCase {
  constructor(
    private readonly faqRepository: IFAQRepository,
    private readonly faqFactory: FAQItemFactory
  ) {}

  async execute(input: CreateFAQItemDTO): Promise<FAQItemDTO> {
    // Create FAQ item using factory
    const faqItem = this.faqFactory.create(input);

    // Save to repository
    await this.faqRepository.save(faqItem);

    // Return DTO
    return FAQMapper.toDTO(faqItem);
  }
}


