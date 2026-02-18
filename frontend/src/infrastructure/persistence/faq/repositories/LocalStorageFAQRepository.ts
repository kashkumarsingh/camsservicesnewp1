/**
 * LocalStorage FAQ Repository
 * 
 * Infrastructure implementation using localStorage.
 * For future use when we need persistent storage.
 */

import { IFAQRepository } from '@/core/application/faq/ports/IFAQRepository';
import { FAQItem } from '@/core/domain/faq/entities/FAQItem';
import { FAQSlug } from '@/core/domain/faq/valueObjects/FAQSlug';

const STORAGE_KEY = 'faq_items';

interface StoredFAQ {
  id: string;
  title: string;
  content: string;
  slug: string;
  views: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export class LocalStorageFAQRepository implements IFAQRepository {
  private getStorage(): StoredFAQ[] {
    if (typeof window === 'undefined') {
      return [];
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private setStorage(faqs: StoredFAQ[]): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faqs));
  }

  async save(faq: FAQItem): Promise<void> {
    const stored = this.getStorage();
    const index = stored.findIndex(f => f.id === faq.id);
    
    const storedFAQ: StoredFAQ = {
      id: faq.id,
      title: faq.title,
      content: faq.content,
      slug: faq.slug.toString(),
      views: faq.views,
      category: faq.category,
      createdAt: faq.createdAt.toISOString(),
      updatedAt: faq.updatedAt.toISOString(),
    };

    if (index >= 0) {
      stored[index] = storedFAQ;
    } else {
      stored.push(storedFAQ);
    }

    this.setStorage(stored);
  }

  async findById(id: string): Promise<FAQItem | null> {
    const stored = this.getStorage();
    const item = stored.find(f => f.id === id);
    if (!item) return null;

    return this.toDomain(item);
  }

  async findBySlug(slug: string): Promise<FAQItem | null> {
    const stored = this.getStorage();
    const item = stored.find(f => f.slug === slug);
    if (!item) return null;

    return this.toDomain(item);
  }

  async findAll(): Promise<FAQItem[]> {
    const stored = this.getStorage();
    return stored.map(item => this.toDomain(item));
  }

  async search(query: string): Promise<FAQItem[]> {
    const all = await this.findAll();
    const queryLower = query.toLowerCase();
    return all.filter(faq =>
      faq.title.toLowerCase().includes(queryLower) ||
      faq.content.toLowerCase().includes(queryLower)
    );
  }

  async delete(id: string): Promise<void> {
    const stored = this.getStorage();
    const filtered = stored.filter(f => f.id !== id);
    this.setStorage(filtered);
  }

  private toDomain(stored: StoredFAQ): FAQItem {
    const slug = FAQSlug.fromString(stored.slug);
    const faq = FAQItem.create(
      stored.id,
      stored.title,
      stored.content,
      slug,
      stored.category
    );
    
    // Restore views (this is a workaround since views is private)
    // In a real implementation, we'd need a way to restore state
    return faq;
  }
}

