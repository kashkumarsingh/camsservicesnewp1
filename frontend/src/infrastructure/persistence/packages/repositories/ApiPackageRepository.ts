/**
 * API Package Repository
 * 
 * Infrastructure implementation using remote backend API.
 * Implements IPackageRepository interface for Clean Architecture.
 * 
 * Uses generic "Remote" naming to be CMS-agnostic (could be Laravel, Sanity, Contentful, etc.)
 */

import { IPackageRepository, PackageListMetrics, PackageListResult } from '@/core/application/packages/ports/IPackageRepository';
import { Package } from '@/core/domain/packages/entities/Package';
import { PackageSlug } from '@/core/domain/packages/valueObjects/PackageSlug';
import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import {
  PackageActivity,
  PackagePerformanceMetrics,
  PackageTrainerSummary,
  PackageTestimonialSummary,
  PackageTrustIndicator,
} from '@/core/domain/packages/entities/Package';

/**
 * Remote API Response Format
 * Expected response structure from remote backend API (camelCase)
 * Generic naming allows switching between Laravel, Sanity, Contentful, etc.
 */
interface RemotePackageTrainer {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  role?: string;
  rating?: number | null;
  totalReviews?: number;
  specialties?: string[];
  experienceYears?: number;
  isFeatured?: boolean;
}

interface RemotePackageActivity {
  id: number;
  name: string;
  slug?: string;
  imageUrl: string;
  duration: number;
  description: string;
  trainerIds?: number[];
  trainers?: RemotePackageTrainer[];
  order?: number;
}

interface RemotePackageMetrics {
  activityCount: number;
  trainerCount: number;
  pricePerHour?: number | null;
  spotsRemaining?: number;
  totalSpots: number;
}

interface RemotePackageTestimonial {
  id: string;
  authorName: string;
  authorRole?: string | null;
  quote: string;
  rating?: number | null;
  sourceLabel?: string | null;
  sourceType?: string | null;
  avatarUrl?: string | null;
}

interface RemotePackageTrustIndicator {
  label: string;
  value?: string;
  icon?: string;
}

interface RemotePackageResponse {
  id: string;
  name: string;
  description: string;
  slug: string;
  hours: number;
  price: number;
  duration: string;
  color: string;
  features: string[];
  activities: RemotePackageActivity[];
  perks: string[];
  popular: boolean;
  isActive?: boolean; // Indicates if package is active (is_active = true)
  hours_per_week: number;
  hoursPerActivity?: number;
  calculatedActivities?: number;
  allowActivityOverride?: boolean;
  spots_remaining?: number;
  views: number;
  created_at: string;
  updated_at: string;
  trainers?: RemotePackageTrainer[];
  metrics?: RemotePackageMetrics;
  testimonials?: RemotePackageTestimonial[];
  trustIndicators?: RemotePackageTrustIndicator[];
}

interface RemotePackageListMetricsSummary {
  totalPackages: number;
  popularPackages: number;
  totalSpots: number;
  spotsRemaining: number;
  averageAvailability: number;
  averagePrice: number;
  averageHoursPerWeek: number;
  uniqueActivities: number;
  uniqueTrainers: number;
}

interface RemotePackageListMeta {
  count?: number;
  metrics?: RemotePackageListMetricsSummary;
}

interface RemotePackageListResponse {
  data: RemotePackageResponse[];
  meta?: RemotePackageListMeta;
}

export class ApiPackageRepository implements IPackageRepository {
  // Store API-specific fields that don't belong in domain entity
  private apiSpecificFields = new Map<string, {
    hoursPerActivity?: number;
    calculatedActivities?: number;
    allowActivityOverride?: boolean;
  }>();

  /**
   * Get API-specific fields for a package
   */
  getApiSpecificFields(packageId: string): {
    hoursPerActivity?: number;
    calculatedActivities?: number;
    allowActivityOverride?: boolean;
  } {
    return this.apiSpecificFields.get(packageId) || {};
  }

  /**
   * Convert remote API response to domain entity
   */
  private toDomain(response: RemotePackageResponse): Package {
    // Store API-specific fields
    this.apiSpecificFields.set(response.id, {
      hoursPerActivity: response.hoursPerActivity,
      calculatedActivities: response.calculatedActivities,
      allowActivityOverride: response.allowActivityOverride,
    });
    const slug = PackageSlug.fromString(response.slug);
    
    // Extract weeks from duration string
    const weeksMatch = response.duration.match(/(\d+)\s+weeks?/);
    const totalWeeks = weeksMatch ? parseInt(weeksMatch[1]) : 6;
    
    const trainers: PackageTrainerSummary[] = response.trainers?.map((trainer) => ({
      id: trainer.id,
      name: trainer.name,
      slug: trainer.slug,
      avatarUrl: trainer.avatarUrl,
      role: trainer.role,
      rating: trainer.rating,
      totalReviews: trainer.totalReviews,
      specialties: trainer.specialties,
      experienceYears: trainer.experienceYears,
      isFeatured: trainer.isFeatured,
    })) ?? [];

    const activities: PackageActivity[] = response.activities?.map((activity) => ({
      id: activity.id,
      name: activity.name,
      slug: activity.slug,
      imageUrl: activity.imageUrl,
      duration: activity.duration,
      description: activity.description,
      trainerIds: activity.trainerIds,
      trainers: activity.trainers?.map((trainer) => ({
        id: trainer.id,
        name: trainer.name,
        slug: trainer.slug,
        avatarUrl: trainer.avatarUrl,
        role: trainer.role,
        rating: trainer.rating,
        totalReviews: trainer.totalReviews,
        specialties: trainer.specialties,
        experienceYears: trainer.experienceYears,
        isFeatured: trainer.isFeatured,
      })),
      order: activity.order,
    })) ?? [];

    const metrics: PackagePerformanceMetrics | undefined = response.metrics
      ? {
          activityCount: response.metrics.activityCount,
          trainerCount: response.metrics.trainerCount,
          pricePerHour: response.metrics.pricePerHour,
          spotsRemaining: response.metrics.spotsRemaining,
          totalSpots: response.metrics.totalSpots,
        }
      : undefined;

    return Package.create(
      response.id,
      response.name,
      response.description,
      response.hours,
      response.price,
      response.hours_per_week,
      totalWeeks,
      response.color,
      response.features,
      activities,
      response.perks,
      slug,
      response.popular,
      response.spots_remaining,
      trainers,
      metrics,
      response.testimonials?.map<PackageTestimonialSummary>((testimonial) => ({
        id: testimonial.id,
        authorName: testimonial.authorName,
        authorRole: testimonial.authorRole,
        quote: testimonial.quote,
        rating: testimonial.rating,
        sourceLabel: testimonial.sourceLabel,
        sourceType: testimonial.sourceType,
        avatarUrl: testimonial.avatarUrl,
      })),
      response.trustIndicators?.map<PackageTrustIndicator>((indicator) => ({
        label: indicator.label,
        value: indicator.value,
        icon: indicator.icon,
      }))
    );
  }

  /**
   * Convert domain entity to remote API request format
   */
  private toApi(pkg: Package): Partial<RemotePackageResponse> {
    return {
      name: pkg.name,
      description: pkg.description,
      slug: pkg.slug.toString(),
      hours: pkg.hours.value,
      price: pkg.price.amount,
      duration: pkg.duration.format(),
      color: pkg.color,
      features: pkg.features,
      activities: pkg.activities,
      perks: pkg.perks,
      popular: pkg.popular,
      hours_per_week: pkg.duration.hoursPerWeek,
      spots_remaining: pkg.spotsRemaining,
      views: pkg.views,
    };
  }

  async save(pkg: Package): Promise<void> {
    const apiData = this.toApi(pkg);
    
    try {
      if (pkg.id.match(/^\d+$/)) {
        // Update existing package (numeric ID from API)
        await apiClient.put<RemotePackageResponse>(
          `${API_ENDPOINTS.PACKAGES}/${pkg.id}`,
          apiData
        );
      } else {
        // New package
        await apiClient.post<RemotePackageResponse>(
          API_ENDPOINTS.PACKAGES,
          apiData
        );
      }
    } catch (error) {
      throw new Error(`Failed to save package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findById(id: string): Promise<Package | null> {
    // Backend API only supports finding by slug, not by ID
    // If the ID is numeric, we can't find it by ID via the current API
    // Return null gracefully instead of making a request that will fail
    if (!/^\d+$/.test(id)) {
      // Not a numeric ID, likely a slug - return null to let findBySlug handle it
      return null;
    }

    try {
      // Try to find by ID (though backend may treat it as slug)
      // This is a fallback - the backend route /packages/{slug} might work for numeric slugs
      const response = await apiClient.get<RemotePackageResponse>(
        `${API_ENDPOINTS.PACKAGES}/${id}`
      );
      return this.toDomain(response.data);
    } catch (error: any) {
      // Gracefully handle all errors - return null to allow findBySlug fallback
      // This prevents errors from blocking the use case from trying alternative methods
      return null;
    }
  }

  async findBySlug(slug: string): Promise<Package | null> {
    try {
      // Backend route is /packages/{slug} (path parameter, not query)
      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      const response = await apiClient.get<RemotePackageResponse>(
        API_ENDPOINTS.PACKAGE_BY_SLUG(slug)
      );
      
      // ApiClient already unwraps, so response.data is the actual package data
      if (!response.data) {
        return null;
      }
      
      // Handle array response (shouldn't happen for single package, but safe)
      if (Array.isArray(response.data)) {
        return response.data.length > 0 ? this.toDomain(response.data[0]) : null;
      }
      
      return this.toDomain(response.data);
    } catch (error) {
      // Gracefully handle 404, timeout, or other errors
      if (error instanceof Error) {
        const apiError = error as any;
        if (apiError.response?.status === 404 || apiError.message?.includes('timeout') || apiError.message?.includes('not found')) {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[ApiPackageRepository] Package with slug "${slug}" not found (404)`);
          }
          return null;
        }
      }
      // Log other errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`[ApiPackageRepository] Error fetching package by slug "${slug}":`, error);
      }
      // Return null instead of throwing to allow graceful fallback
      return null;
    }
  }

  async findAllWithMeta(): Promise<PackageListResult> {
    try {
      const response = await apiClient.get<RemotePackageListResponse | RemotePackageResponse[]>(
        API_ENDPOINTS.PACKAGES
      );

      let payload: RemotePackageListResponse;
      if (Array.isArray(response.data)) {
        payload = { data: response.data };
      } else {
        payload = response.data as RemotePackageListResponse;
      }

      const packages = payload.data.map(pkg => this.toDomain(pkg));
      const metrics = payload.meta?.metrics ? this.mapCollectionMetrics(payload.meta.metrics) : undefined;

      return { packages, metrics };
    } catch (error: any) {
      // For timeout errors, return empty result instead of throwing
      // This allows timeout wrappers to handle gracefully
      if (error.message?.includes('timeout') || error.code === 'TIMEOUT') {
        console.warn('[ApiPackageRepository] Request timed out, returning empty result');
        return { packages: [], metrics: undefined };
      }
      
      // Provide more descriptive error messages for other errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
        throw new Error('Unable to connect to the server. Please check your internet connection and ensure the backend service is running.');
      }
      if (error.response?.status === 404) {
        throw new Error('Packages endpoint not found. Please check the API configuration.');
      }
      if (error.response?.status >= 500) {
        throw new Error('Server error occurred while fetching packages. Please try again later.');
      }
      throw new Error(`Failed to fetch packages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async findAll(): Promise<Package[]> {
    const result = await this.findAllWithMeta();
    return result.packages;
  }

  async search(query: string): Promise<Package[]> {
    try {
      const response = await apiClient.get<RemotePackageResponse[] | RemotePackageListResponse>(
        `${API_ENDPOINTS.PACKAGES}?search=${encodeURIComponent(query)}`
      );
      
      let packages: RemotePackageResponse[];
      if (Array.isArray(response.data)) {
        packages = response.data;
      } else if ('data' in response.data) {
        packages = (response.data as RemotePackageListResponse).data;
      } else {
        packages = [];
      }
      
      return packages.map(pkg => this.toDomain(pkg));
    } catch (error) {
      throw new Error(`Failed to search packages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private mapCollectionMetrics(metrics: RemotePackageListMetricsSummary): PackageListMetrics {
    return {
      totalPackages: metrics.totalPackages,
      popularPackages: metrics.popularPackages,
      totalSpots: metrics.totalSpots,
      spotsRemaining: metrics.spotsRemaining,
      averageAvailability: metrics.averageAvailability,
      averagePrice: metrics.averagePrice,
      averageHoursPerWeek: metrics.averageHoursPerWeek,
      uniqueActivities: metrics.uniqueActivities,
      uniqueTrainers: metrics.uniqueTrainers,
    };
  }

  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`${API_ENDPOINTS.PACKAGES}/${id}`);
    } catch (error) {
      throw new Error(`Failed to delete package: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}


