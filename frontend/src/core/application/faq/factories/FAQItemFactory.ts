/**
 * FAQ Item Factory
 * 
 * Factory for creating FAQ items.
 * Handles complex creation logic and validation.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { FAQSlug } from '../../../domain/faq/valueObjects/FAQSlug';
import { CreateFAQItemDTO } from '../dto/CreateFAQItemDTO';
import { IIdGenerator } from '../ports/IIdGenerator';

export class FAQItemFactory {
  constructor(private readonly idGenerator: IIdGenerator) {}

  create(input: CreateFAQItemDTO): FAQItem {
    // Generate ID
    const id = this.idGenerator.generate();

    // Generate slug from title
    const slug = FAQSlug.fromTitle(input.title);

    // Create FAQ item with business rules enforced
    return FAQItem.create(
      id,
      input.title,
      input.content,
      slug,
      input.category
    );
  }
}


