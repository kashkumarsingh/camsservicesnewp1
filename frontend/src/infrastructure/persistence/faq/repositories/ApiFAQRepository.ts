/**
 * API FAQ Repository
 * 
 * Infrastructure implementation using remote backend API.
 * Implements IFAQRepository interface for Clean Architecture.
 * 
 * Uses generic "Remote" naming to be CMS-agnostic (could be Laravel, Sanity, Contentful, etc.)
 */

import { IFAQRepository } from '@/core/application/faq/ports/IFAQRepository';
import { FAQItem } from '@/core/domain/faq/entities/FAQItem';
import { FAQSlug } from '@/core/domain/faq/valueObjects/FAQSlug';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Remote API Response Format
 * Expected response structure from remote backend API (camelCase)
 * Generic naming allows switching between Laravel, Sanity, Contentful, etc.
 */
interface RemoteFAQResponse {
  id: string;
  title: string;
  content: string;
  slug: string;
  views: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}

export class ApiFAQRepository implements IFAQRepository {

  /**
   * Convert remote API response to domain entity
   */
  private toDomain(response: RemoteFAQResponse): FAQItem {
    const slug = FAQSlug.fromString(response.slug);
    
    // Create FAQ item from API response
    // Note: We need to handle the fact that FAQItem.create() doesn't accept all fields
    // In a real implementation, we might need a factory method that accepts persisted data
    const faq = FAQItem.create(
      response.id,
      response.title,
      response.content,
      slug,
      response.category
    );

    // Restore views and timestamps
    // Since views is private, we need to work around this
    // In production, you might want to add a static method to FAQItem for reconstruction
    return faq;
  }

  /**
   * Convert domain entity to remote API request format
   */
  private toApi(faq: FAQItem): Partial<RemoteFAQResponse> {
    return {
      title: faq.title,
      content: faq.content,
      slug: faq.slug.toString(),
      category: faq.category,
      views: faq.views,
    };
  }

  async save(faq: FAQItem): Promise<void> {
    const apiData = this.toApi(faq);
    
    try {
      if (faq.id.startsWith('faq-')) {
        // New FAQ
        await apiClient.post<RemoteFAQResponse>(API_ENDPOINTS.FAQS, apiData);
      } else {
        // Update existing FAQ
        await apiClient.put<RemoteFAQResponse>(`${API_ENDPOINTS.FAQS}/${faq.id}`, apiData);
      }
    } catch (error) {
      throw new Error(`Failed to save FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<FAQItem | null> {
    try {
      const response = await apiClient.get<RemoteFAQResponse>(`${API_ENDPOINTS.FAQS}/${id}`);
      // ApiClient already unwraps { success: true, data: {...} } to { data: {...} }
      return this.toDomain(response.data);
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw new Error(`Failed to find FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySlug(slug: string): Promise<FAQItem | null> {
    try {
      const response = await apiClient.get<RemoteFAQResponse>(API_ENDPOINTS.FAQ_BY_SLUG(slug));
      // ApiClient already unwraps { success: true, data: {...} } to { data: {...} }
      return this.toDomain(response.data);
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw new Error(`Failed to find FAQ by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<FAQItem[]> {
    try {
      const response = await apiClient.get<RemoteFAQResponse[]>(API_ENDPOINTS.FAQS);
      // ApiClient already unwraps { success: true, data: [...] } to { data: [...] }
      const faqs = Array.isArray(response.data) ? response.data : [];
      return faqs.map(faq => this.toDomain(faq));
    } catch (error) {
      throw new Error(`Failed to fetch FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Find FAQs with optional filters (category, search, etc.)
   * This method builds query parameters and calls the API
   */
  async findWithFilters(filters?: { category?: string; search?: string }): Promise<FAQItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.category) {
        params.append('category', filters.category);
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      
      const url = params.toString() 
        ? `${API_ENDPOINTS.FAQS}?${params.toString()}`
        : API_ENDPOINTS.FAQS;
      
      const response = await apiClient.get<RemoteFAQResponse[]>(url);
      const faqs = Array.isArray(response.data) ? response.data : [];
      return faqs.map(faq => this.toDomain(faq));
    } catch (error) {
      throw new Error(`Failed to fetch FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<FAQItem[]> {
    try {
      const response = await apiClient.get<RemoteFAQResponse[]>(`${API_ENDPOINTS.FAQS}?search=${encodeURIComponent(query)}`);
      // ApiClient already unwraps { success: true, data: [...] } to { data: [...] }
      const faqs = Array.isArray(response.data) ? response.data : [];
      return faqs.map(faq => this.toDomain(faq));
    } catch (error) {
      throw new Error(`Failed to search FAQs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.FAQS}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete FAQ: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

