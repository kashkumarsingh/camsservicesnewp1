/**
 * API Activity Repository
 * 
 * Infrastructure implementation using Laravel backend API.
 */

import { IActivityRepository } from '@/core/application/activities/ports/IActivityRepository';
import { Activity } from '@/core/domain/activities/entities/Activity';
import { ActivitySlug } from '@/core/domain/activities/valueObjects/ActivitySlug';
import { ActivityTrainer } from '@/core/domain/activities/entities/Activity';
import { apiClient } from '@/infrastructure/http/ApiClient';

/**
 * Laravel API Response Format
 * Note: Backend returns camelCase (imageUrl, difficultyLevel, etc.)
 */
interface LaravelActivityResponse {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string; // Backend uses camelCase
  image_url?: string; // Fallback for snake_case
  duration: number;
  trainer_ids?: number[]; // May be missing, will be empty array
  trainers?: ActivityTrainer[];
  category?: string;
  age_range?: string;
  ageGroup?: string; // Backend camelCase
  difficultyLevel?: string; // Backend camelCase
  isActive?: boolean; // Backend camelCase
  views?: number;
  published?: boolean;
  createdAt?: string; // Backend camelCase
  updatedAt?: string; // Backend camelCase
  created_at?: string; // Fallback
  updated_at?: string; // Fallback
}

export class ApiActivityRepository implements IActivityRepository {
  private readonly endpoint = '/activities';

  private toDomain(response: LaravelActivityResponse): Activity {
    const slug = ActivitySlug.fromString(response.slug);
    
    // Handle image URL - backend uses camelCase (imageUrl), fallback to snake_case (image_url)
    const imageUrl = response.imageUrl || response.image_url || '/images/activities/default-activity.webp';
    
    // Handle description - API may return null/empty for legacy or incomplete data; entity requires non-empty
    const description =
      response.description != null && String(response.description).trim().length > 0
        ? String(response.description).trim()
        : 'No description';
    
    // Ensure trainer_ids is always an array (fallback to empty array if undefined/null)
    // Note: Backend may not include trainer_ids in response, which is acceptable
    const trainerIds = Array.isArray(response.trainer_ids) ? response.trainer_ids : [];
    
    // Handle published flag - backend uses isActive, fallback to published
    const published = response.isActive !== undefined ? response.isActive : (response.published ?? true);
    
    return Activity.create(
      response.id,
      response.name,
      description,
      imageUrl,
      response.duration,
      trainerIds,
      slug,
      response.category,
      response.age_range || response.ageGroup,
      response.trainers,
      published
    );
  }

  private toApi(activity: Activity): Partial<LaravelActivityResponse> {
    return {
      name: activity.name,
      slug: activity.slug.toString(),
      description: activity.description,
      image_url: activity.imageUrl,
      duration: activity.duration.hours,
      trainer_ids: activity.trainerIds,
      trainers: activity.trainers,
      category: activity.category,
      age_range: activity.ageRange,
      published: activity.published,
    };
  }

  async save(activity: Activity): Promise<void> {
    const apiData = this.toApi(activity);
    
    try {
      if (activity.id.match(/^\d+$/)) {
        // Update existing activity
        await apiClient.put<LaravelActivityResponse>(
          `${this.endpoint}/${activity.id}`,
          apiData
        );
      } else {
        // New activity
        await apiClient.post<LaravelActivityResponse>(
          this.endpoint,
          apiData
        );
      }
    } catch (error) {
      throw new Error(`Failed to save activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Activity | null> {
    try {
      const response = await apiClient.get<LaravelActivityResponse>(
        `${this.endpoint}/${id}`
      );
      return this.toDomain(response.data);
    } catch (error) {
      if (error instanceof Error && 'status' in error && (error as any).status === 404) {
        return null;
      }
      throw new Error(`Failed to find activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySlug(slug: string): Promise<Activity | null> {
    try {
      const response = await apiClient.get<LaravelActivityResponse>(
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
      throw new Error(`Failed to find activity by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: LaravelActivityResponse[] }>(this.endpoint);
      const payload = response.data;
      const raw: LaravelActivityResponse[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).data)
          ? (payload as any).data
          : [];

      return raw.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findPublished(): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: LaravelActivityResponse[] }>(this.endpoint);
      const payload = response.data;
      const raw: LaravelActivityResponse[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).data)
          ? (payload as any).data
          : [];

      return raw.map(item => this.toDomain(item));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch published activities:', error);
      throw new Error(`Failed to fetch published activities: ${errorMessage}`);
    }
  }

  async findByCategory(category: string): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: LaravelActivityResponse[] }>(
        `${this.endpoint}?category=${encodeURIComponent(category)}`
      );

      const payload = response.data;
      const raw: LaravelActivityResponse[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).data)
          ? (payload as any).data
          : [];

      return raw.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find activities by category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByTrainer(trainerId: number): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: LaravelActivityResponse[] }>(
        `${this.endpoint}?trainer_id=${trainerId}`
      );

      const payload = response.data;
      const raw: LaravelActivityResponse[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).data)
          ? (payload as any).data
          : [];

      return raw.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find activities by trainer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<Activity[]> {
    try {
      const response = await apiClient.get<{ data: LaravelActivityResponse[] }>(
        `${this.endpoint}?search=${encodeURIComponent(query)}`
      );

      const payload = response.data;
      const raw: LaravelActivityResponse[] = Array.isArray(payload)
        ? payload
        : Array.isArray((payload as any).data)
          ? (payload as any).data
          : [];

      return raw.map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to search activities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.endpoint}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete activity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


