/**
 * FAQ Repository Interface
 * 
 * Port (interface) for FAQ repository.
 * Application layer depends on this, not implementation.
 */

import { FAQItem } from '../../../domain/faq/entities/FAQItem';

export interface IFAQRepository {
  save(faq: FAQItem): Promise<void>;
  findById(id: string): Promise<FAQItem | null>;
  findBySlug(slug: string): Promise<FAQItem | null>;
  findAll(): Promise<FAQItem[]>;
  search(query: string): Promise<FAQItem[]>;
  delete(id: string): Promise<void>;
}


