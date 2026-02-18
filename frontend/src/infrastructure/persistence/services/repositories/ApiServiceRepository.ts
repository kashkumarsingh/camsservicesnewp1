/**
 * API Service Repository
 * 
 * Infrastructure implementation using remote backend API.
 * Implements IServiceRepository interface for Clean Architecture.
 * 
 * Uses generic "Remote" naming to be CMS-agnostic (could be Laravel, Sanity, Contentful, etc.)
 */

import { IServiceRepository } from '@/core/application/services/ports/IServiceRepository';
import { Service } from '@/core/domain/services/entities/Service';
import { ServiceSlug } from '@/core/domain/services/valueObjects/ServiceSlug';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Remote API Response Format
 * Expected response structure from remote backend API (camelCase)
 * Generic naming allows switching between Laravel, Sanity, Contentful, etc.
 */
interface RemoteServiceResponse {
  id: string;
  title: string;
  summary?: string;
  description: string;
  body?: string;
  slug: string;
  icon?: string;
  views: number;
  category?: string;
  published: boolean;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface RemoteServiceListResponse {
  success: boolean;
  data: RemoteServiceResponse[];
  meta?: {
    currentPage: number;
    lastPage: number;
    perPage: number;
    total: number;
  };
}

interface RemoteSingleServiceResponse {
  success: boolean;
  data: RemoteServiceResponse;
}

export class ApiServiceRepository implements IServiceRepository {
  /**
   * Convert remote API response to domain entity
   */
  private toDomain(response: RemoteServiceResponse): Service {
    const slug = ServiceSlug.fromString(response.slug);
    
    return Service.create(
      response.id,
      response.title,
      response.description,
      slug,
      response.icon,
      response.category,
      response.summary,
      response.body,
      response.published,
      response.publishAt ? new Date(response.publishAt) : undefined
    );
  }

  /**
   * Convert domain entity to remote API request format
   */
  private toApi(service: Service): Partial<RemoteServiceResponse> {
    return {
      title: service.title,
      summary: service.summary,
      description: service.description,
      body: service.body,
      slug: service.slug.toString(),
      icon: service.icon,
      category: service.category,
      views: service.views,
      published: service.published,
      publishAt: service.publishAt?.toISOString(),
    };
  }

  async save(service: Service): Promise<void> {
    const apiData = this.toApi(service);
    
    try {
      if (service.id.startsWith('service-')) {
        // New service
        const response = await apiClient.post<RemoteSingleServiceResponse>(
          API_ENDPOINTS.SERVICES,
          apiData
        );
      } else {
        // Update existing service
        await apiClient.put<RemoteSingleServiceResponse>(
          `${API_ENDPOINTS.SERVICES}/${service.id}`,
          apiData
        );
      }
    } catch (error) {
      throw new Error(`Failed to save service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Service | null> {
    try {
      const response = await apiClient.get<RemoteServiceResponse>(
        `${API_ENDPOINTS.SERVICES}/${id}`
      );
      // ApiClient already unwraps { success: true, data: {...} } to { data: {...} }
      return this.toDomain(response.data);
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw new Error(`Failed to find service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySlug(slug: string): Promise<Service | null> {
    try {
      const response = await apiClient.get<RemoteServiceResponse>(
        API_ENDPOINTS.SERVICE_BY_SLUG(slug)
      );
      // ApiClient already unwraps { success: true, data: {...} } to { data: {...} }
      return this.toDomain(response.data);
    } catch (error: any) {
      if (error?.status === 404) {
        return null;
      }
      throw new Error(`Failed to find service by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const response = await apiClient.get<RemoteServiceResponse[]>(
        API_ENDPOINTS.SERVICES
      );
      // ApiClient already unwraps { success: true, data: [...] } to { data: [...] }
      const services = Array.isArray(response.data) ? response.data : [];
      return services.map(service => this.toDomain(service));
    } catch (error: unknown) {
      // Graceful degradation: return empty list so contact/landing pages still render
      const message = error && typeof error === 'object' && 'message' in error
        ? String((error as { message: unknown }).message)
        : 'Unknown error';
      console.warn('[ApiServiceRepository] Failed to fetch services, returning empty list:', message);
      return [];
    }
  }

  async search(query: string): Promise<Service[]> {
    try {
      const response = await apiClient.get<RemoteServiceResponse[]>(
        `${API_ENDPOINTS.SERVICES}?search=${encodeURIComponent(query)}`
      );
      // ApiClient already unwraps { success: true, data: [...] } to { data: [...] }
      const services = Array.isArray(response.data) ? response.data : [];
      return services.map(service => this.toDomain(service));
    } catch (error) {
      throw new Error(`Failed to search services: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.SERVICES}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


