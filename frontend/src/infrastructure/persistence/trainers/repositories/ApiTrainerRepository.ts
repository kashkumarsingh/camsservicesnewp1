/**
 * API Trainer Repository
 */

import { ITrainerRepository } from '@/core/application/trainers/ports/ITrainerRepository';
import { Trainer } from '@/core/domain/trainers/entities/Trainer';
import { TrainerSlug } from '@/core/domain/trainers/valueObjects/TrainerSlug';
import { TrainerCapability } from '@/core/domain/trainers/valueObjects/TrainerCapability';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

/**
 * Remote API Response Format
 * Expected response structure from remote backend API (camelCase)
 * Generic naming allows switching between Laravel, Sanity, Contentful, etc.
 */
interface RemoteTrainerResponse {
  id: string;
  name: string;
  slug: string;
  role: string;
  summary: string;
  description?: string;
  rating: number;
  image: {
    src: string;
    alt: string;
  };
  certifications: string[];
  specialties: string[];
  capabilities: string[];
  available: boolean;
  experience_years?: number;
  views: number;
  // Location data for filtering
  home_postcode?: string | null;
  travel_radius_km?: number | null;
  service_area_postcodes?: string[];
  service_regions?: string[];
  created_at: string;
  updated_at: string;
}

export class ApiTrainerRepository implements ITrainerRepository {

  /**
   * Normalize backend capability names to frontend capability values
   * Maps human-readable names (e.g., "Creative Play") to domain values (e.g., "creative_support")
   */
  private normalizeCapabilities(backendCapabilities: string[]): string[] {
    const capabilityMap: Record<string, string> = {
      // Creative/Artistic capabilities
      'creative play': 'creative_support',
      'creative activities': 'creative_support',
      'artistic support': 'creative_support',
      'art therapy': 'creative_support',
      
      // Mentoring
      'mentoring': 'mentoring',
      'mentor': 'mentoring',
      'mentorship': 'mentoring',
      
      // Outdoor activities
      'outdoor exploration': 'outdoor_support',
      'outdoor activities': 'outdoor_support',
      'outdoor support': 'outdoor_support',
      
      // Travel/Escort
      'travel escort': 'travel_escort',
      'escort': 'escort',
      'school run': 'school_run',
      
      // Therapy/Support
      'therapy companion': 'therapy_companion',
      'therapy support': 'therapy_companion',
      
      // Other support types
      'respite': 'respite',
      'respite care': 'respite',
      'exam support': 'exam_support',
      'hospital support': 'hospital_support',
      'sequential learning': 'sequential_learning',
    };

    const normalized: string[] = [];
    const allowedCapabilities = TrainerCapability.allowed();

    for (const capability of backendCapabilities) {
      const normalizedKey = capability.trim().toLowerCase();
      const mappedValue = capabilityMap[normalizedKey];
      
      // If we have a mapping, use it
      if (mappedValue && allowedCapabilities.includes(mappedValue as any)) {
        normalized.push(mappedValue);
      }
      // If the capability is already in the correct format, use it
      else if (allowedCapabilities.includes(normalizedKey as any)) {
        normalized.push(normalizedKey);
      }
      // Otherwise, skip it (don't throw error, just filter out unsupported capabilities)
    }

    return normalized;
  }

  private toDomain(response: RemoteTrainerResponse): Trainer {
    const slug = TrainerSlug.fromString(response.slug);
    
    // Normalize capabilities before creating the domain entity
    const normalizedCapabilities = this.normalizeCapabilities(response.capabilities || []);

    return Trainer.create(
      response.id,
      response.name,
      response.role,
      response.summary,
      response.rating,
      response.image,
      {
        slug,
        description: response.description,
        certifications: response.certifications,
        specialties: response.specialties,
        capabilities: normalizedCapabilities,
        available: response.available,
        experienceYears: response.experience_years,
        views: response.views,
      }
    );
  }

  private toApi(trainer: Trainer): Partial<RemoteTrainerResponse> {
    return {
      name: trainer.name,
      slug: trainer.slug.toString(),
      role: trainer.role,
      summary: trainer.summary,
      description: trainer.description,
      rating: trainer.ratingValue,
      image: trainer.image,
      certifications: trainer.certifications,
      specialties: trainer.specialties,
      capabilities: trainer.capabilities,
      available: trainer.available,
      experience_years: trainer.experienceYears,
      views: trainer.views,
    };
  }

  async save(trainer: Trainer): Promise<void> {
    const apiData = this.toApi(trainer);

    try {
      if (trainer.id.match(/^\d+$/)) {
        await apiClient.put<RemoteTrainerResponse>(`${API_ENDPOINTS.TRAINERS}/${trainer.id}`, apiData);
      } else {
        await apiClient.post<RemoteTrainerResponse>(API_ENDPOINTS.TRAINERS, apiData);
      }
    } catch (error) {
      throw new Error(`Failed to save trainer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Trainer | null> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse>(`${API_ENDPOINTS.TRAINERS}/${id}`);
      return this.toDomain(response.data);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const message = (error as { message?: string })?.message ?? (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unknown error';
      if (status === 404) {
        return null;
      }
      throw new Error(`Failed to find trainer: ${message}`);
    }
  }

  async findBySlug(slug: string): Promise<Trainer | null> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse>(API_ENDPOINTS.TRAINER_BY_SLUG(slug));

      if (Array.isArray(response.data)) {
        return response.data.length > 0 ? this.toDomain(response.data[0]) : null;
      }

      return this.toDomain(response.data);
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const message = (error as { message?: string })?.message ?? (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unknown error';
      if (status === 404) {
        return null;
      }
      throw new Error(`Failed to find trainer by slug: ${message}`);
    }
  }

  async findAll(): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse[]>(API_ENDPOINTS.TRAINERS);
      return (Array.isArray(response.data) ? response.data : []).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch trainers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAvailable(): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse[]>(`${API_ENDPOINTS.TRAINERS}?available=true`);
      return (Array.isArray(response.data) ? response.data : []).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to fetch available trainers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByCapability(capability: string): Promise<Trainer[]> {
    if (!TrainerCapability.allowed().includes(capability as any)) {
      return [];
    }

    try {
      const response = await apiClient.get<RemoteTrainerResponse[]>(`${API_ENDPOINTS.TRAINERS}?capability=${encodeURIComponent(capability)}`);
      return (Array.isArray(response.data) ? response.data : []).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find trainers by capability: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findBySpecialty(specialty: string): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse[]>(`${API_ENDPOINTS.TRAINERS}?specialty=${encodeURIComponent(specialty)}`);
      return (Array.isArray(response.data) ? response.data : []).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to find trainers by specialty: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async search(query: string): Promise<Trainer[]> {
    try {
      const response = await apiClient.get<RemoteTrainerResponse[]>(`${API_ENDPOINTS.TRAINERS}?search=${encodeURIComponent(query)}`);
      return (Array.isArray(response.data) ? response.data : []).map(item => this.toDomain(item));
    } catch (error) {
      throw new Error(`Failed to search trainers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.TRAINERS}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete trainer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

