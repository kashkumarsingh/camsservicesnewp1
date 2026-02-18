/**
 * List FAQ Items Use Case
 * 
 * Orchestrates listing FAQ items with filters.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';
import { IFAQRepository } from '../ports/IFAQRepository';
import { FAQMapper } from '../mappers/FAQMapper';
import { FAQFilterOptions } from '../dto/FAQFilterOptions';
import { FAQItemDTO } from '../dto/FAQItemDTO';

export class ListFAQItemsUseCase {
  constructor(private readonly faqRepository: IFAQRepository) {}

  async execute(options?: FAQFilterOptions): Promise<FAQItemDTO[]> {
    // Get FAQs with filters if repository supports it
    // For API repository, we can pass filters directly to reduce data transfer
    let faqs: FAQItem[];
    const useApiFilters = 'findWithFilters' in this.faqRepository && (options?.category || options?.search);
    
    if (useApiFilters) {
      // Use optimized API call with filters (backend handles filtering)
      faqs = await (this.faqRepository as any).findWithFilters({
        category: options?.category,
        search: options?.search,
      });
    } else {
      // Fallback to fetching all and filtering client-side
      faqs = await this.faqRepository.findAll();
      
      // Apply search filter (client-side)
      if (options?.search) {
        const searchLower = options.search.toLowerCase();
        faqs = faqs.filter(faq => 
          faq.title.toLowerCase().includes(searchLower) ||
          faq.content.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter (case-insensitive, client-side)
      if (options?.category) {
        const categoryLower = options.category.toLowerCase();
        faqs = faqs.filter(faq => faq.category?.toLowerCase() === categoryLower);
      }
    }

    // Apply sorting
    if (options?.sortBy) {
      const sortOrder = options.sortOrder || 'asc';
      faqs.sort((a, b) => {
        let comparison = 0;
        
        switch (options.sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'views':
            comparison = a.views - b.views;
            break;
          case 'createdAt':
            comparison = a.createdAt.getTime() - b.createdAt.getTime();
            break;
          case 'updatedAt':
            comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
            break;
        }

        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    // Apply pagination
    if (options?.offset !== undefined) {
      faqs = faqs.slice(options.offset);
    }
    if (options?.limit !== undefined) {
      faqs = faqs.slice(0, options.limit);
    }

    // Return DTOs
    return FAQMapper.toDTOs(faqs);
  }
}


