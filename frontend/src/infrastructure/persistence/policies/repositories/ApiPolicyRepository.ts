/**
 * API Policy Repository
 * 
 * Infrastructure implementation using Laravel backend API.
 */

import { IPolicyRepository } from '@/core/application/policies/ports/IPolicyRepository';
import { Policy } from '@/core/domain/policies/entities/Policy';
import { PolicySlug } from '@/core/domain/policies/valueObjects/PolicySlug';
import { PolicyType } from '@/core/domain/policies/entities/Policy';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { extractList } from '@/infrastructure/http/responseHelpers';

/**
 * Laravel API Response Format
 */
interface LaravelPolicyResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  content: string;
  summary?: string;
  last_updated: string;
  effective_date: string;
  version: string;
  views: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export class ApiPolicyRepository implements IPolicyRepository {
  private readonly endpoint = '/policies';

  private toDomain(response: LaravelPolicyResponse): Policy {
    const slug = PolicySlug.fromString(response.slug);
    
    return Policy.create(
      response.id,
      response.title,
      response.type as PolicyType,
      response.content,
      new Date(response.effective_date),
      response.version,
      slug,
      response.summary,
      response.published
    );
  }

  private toApi(policy: Policy): Partial<LaravelPolicyResponse> {
    return {
      title: policy.title,
      slug: policy.slug.toString(),
      type: policy.type,
      content: policy.content,
      summary: policy.summary,
      effective_date: policy.effectiveDate.toISOString(),
      version: policy.version,
      published: policy.published,
    };
  }

  async save(policy: Policy): Promise<void> {
    const apiData = this.toApi(policy);
    
    try {
      if (policy.id.match(/^\d+$/)) {
        // Update existing policy
        await apiClient.put<LaravelPolicyResponse>(
          `${this.endpoint}/${policy.id}`,
          apiData
        );
      } else {
        // New policy
        await apiClient.post<LaravelPolicyResponse>(
          this.endpoint,
          apiData
        );
      }
    } catch (error) {
      throw new Error(`Failed to save policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Policy | null> {
    try {
      const response = await apiClient.get<LaravelPolicyResponse>(
        `${this.endpoint}/${id}`
      );
      return this.toDomain(response.data);
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null;
      }
      throw new Error(`Failed to find policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySlug(slug: string): Promise<Policy | null> {
    try {
      const response = await apiClient.get<LaravelPolicyResponse>(
        `${this.endpoint}?slug=${encodeURIComponent(slug)}`
      );
      
      if (Array.isArray(response.data)) {
        return response.data.length > 0 ? this.toDomain(response.data[0]) : null;
      }
      
      return this.toDomain(response.data);
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null;
      }
      throw new Error(`Failed to find policy by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByType(type: string): Promise<Policy[]> {
    try {
      const response = await apiClient.get<LaravelPolicyResponse[] | { data: LaravelPolicyResponse[]; meta?: unknown }>(
        `${this.endpoint}?type=${encodeURIComponent(type)}`
      );
      return extractList(response).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find policies by type: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Policy[]> {
    try {
      const response = await apiClient.get<LaravelPolicyResponse[] | { data: LaravelPolicyResponse[]; meta?: unknown }>(
        this.endpoint
      );
      return extractList(response).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch policies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


