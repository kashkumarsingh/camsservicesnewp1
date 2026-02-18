/**
 * FAQ Mapper
 * 
 * Converts domain entities ↔ DTOs.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { FAQItemDTO } from '../dto/FAQItemDTO';
import { CreateFAQItemDTO } from '../dto/CreateFAQItemDTO';

export class FAQMapper {
  static toDTO(faq: FAQItem): FAQItemDTO {
    return {
      id: faq.id,
      title: faq.title,
      content: faq.content,
      slug: faq.slug.toString(),
      views: faq.views,
      category: faq.category,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };
  }

  static toDTOs(faqs: FAQItem[]): FAQItemDTO[] {
    return faqs.map(faq => this.toDTO(faq));
  }

  static fromDTO(dto: FAQItemDTO): FAQItem {
    // Note: This is for reconstruction from persisted data
    // For new entities, use FAQItemFactory
    const { FAQSlug } = require('@/core/domain/faq/valueObjects/FAQSlug');
    const slug = FAQSlug.fromString(dto.slug);
    
    return FAQItem.create(
      dto.id,
      dto.title,
      dto.content,
      slug,
      dto.category
    );
  }
}

