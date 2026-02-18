/**
 * API Testimonial Repository
 *
 * Infrastructure adapter hitting the backend API.
 * Follows CMS-agnostic "Remote" naming conventions.
 */

import { ITestimonialRepository, TestimonialFilterOptions } from '@/core/application/testimonials';
import { Testimonial } from '@/core/domain/testimonials';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';

interface RemoteTestimonialResponse {
  id: string;
  publicId: string;
  slug: string;
  authorName: string;
  authorRole?: string | null;
  authorAvatarUrl?: string | null;
  quote: string;
  rating?: number | null;
  sourceType: 'manual' | 'google' | 'trustpilot' | 'other';
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  locale: string;
  isFeatured: boolean;
  badges?: Array<{ label: string; icon?: string }>;
  metadata?: Record<string, unknown> | null;
  externalReviewId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface RemoteTestimonialListResponse {
  data: RemoteTestimonialResponse[];
}

export class ApiTestimonialRepository implements ITestimonialRepository {
  private toDomain(remote: RemoteTestimonialResponse): Testimonial {
    return Testimonial.create({
      id: remote.id,
      publicId: remote.publicId,
      slug: remote.slug,
      authorName: remote.authorName,
      authorRole: remote.authorRole,
      authorAvatarUrl: remote.authorAvatarUrl,
      quote: remote.quote,
      rating: remote.rating,
      sourceType: remote.sourceType,
      sourceLabel: remote.sourceLabel,
      sourceUrl: remote.sourceUrl,
      locale: remote.locale,
      isFeatured: remote.isFeatured,
      badges: remote.badges ?? [],
      metadata: remote.metadata ?? null,
      externalReviewId: remote.externalReviewId,
      createdAt: remote.createdAt,
      updatedAt: remote.updatedAt,
    });
  }

  async findAll(filters?: TestimonialFilterOptions): Promise<Testimonial[]> {
    try {
      const query = new URLSearchParams();

      if (filters?.featured !== undefined) {
        query.set('featured', String(filters.featured));
      }

      if (filters?.limit) {
        query.set('limit', String(filters.limit));
      }

      if (filters?.locale) {
        query.set('locale', filters.locale);
      }

      if (filters?.sourceTypes?.length) {
        query.set('sourceType', filters.sourceTypes.join(','));
      }

      const response = await apiClient.get<RemoteTestimonialResponse[] | RemoteTestimonialListResponse>(
        `${API_ENDPOINTS.TESTIMONIALS}${query.toString() ? `?${query.toString()}` : ''}`
      );

      const testimonials = Array.isArray(response.data)
        ? response.data
        : (response.data as RemoteTestimonialListResponse).data ?? [];

      return testimonials.map(this.toDomain);
    } catch (error) {
      throw new Error(`Failed to fetch testimonials: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findByIdentifier(identifier: string): Promise<Testimonial | null> {
    try {
      const response = await apiClient.get<RemoteTestimonialResponse>(
        API_ENDPOINTS.TESTIMONIAL_BY_IDENTIFIER(identifier)
      );
      return this.toDomain(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch testimonial: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


