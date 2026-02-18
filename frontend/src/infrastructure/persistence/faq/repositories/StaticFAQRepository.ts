/**
 * Static FAQ Repository
 * 
 * Infrastructure implementation using static data.
 * Uses existing src/data/faqData.tsx for now.
 */

import { IFAQRepository } from '@/core/application/faq/ports/IFAQRepository';
import { FAQItem } from '@/core/domain/faq/entities/FAQItem';
import { FAQSlug } from '@/core/domain/faq/valueObjects/FAQSlug';
import { faqItems } from '@/data/faqData';

export class StaticFAQRepository implements IFAQRepository {
  private faqs: FAQItem[] = [];

  constructor() {
    // Initialize from static data
    this.faqs = faqItems.map((item, index) => {
      const slug = FAQSlug.fromString(item.slug);
      return FAQItem.create(
        `faq-${index + 1}`, // Generate simple ID
        item.title,
        item.content,
        slug
      );
    });
  }

  async save(faq: FAQItem): Promise<void> {
    const index = this.faqs.findIndex(f => f.id === faq.id);
    if (index >= 0) {
      this.faqs[index] = faq;
    } else {
      this.faqs.push(faq);
    }
  }

  async findById(id: string): Promise<FAQItem | null> {
    return this.faqs.find(f => f.id === id) || null;
  }

  async findBySlug(slug: string): Promise<FAQItem | null> {
    return this.faqs.find(f => f.slug.toString() === slug) || null;
  }

  async findAll(): Promise<FAQItem[]> {
    return [...this.faqs];
  }

  async search(query: string): Promise<FAQItem[]> {
    const queryLower = query.toLowerCase();
    return this.faqs.filter(faq =>
      faq.title.toLowerCase().includes(queryLower) ||
      faq.content.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    this.faqs = this.faqs.filter(f => f.id !== id);
  }
}

