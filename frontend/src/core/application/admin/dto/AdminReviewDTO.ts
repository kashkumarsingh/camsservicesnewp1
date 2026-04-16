/**
 * Admin Review DTOs (Application Layer)
 *
 * Clean Architecture Layer: Application (DTO)
 * Purpose: Defines the shape of review source and external review data for the admin dashboard.
 */

/** Review source (Google, Trustpilot) configuration. */
export interface AdminReviewSourceDTO {
  id: string;
  provider: string;
  displayName: string;
  locationId: string | null;
  syncFrequencyMinutes: number;
  lastSyncedAt: string | null;
  lastSyncAttemptAt: string | null;
  lastSyncReviewCount: number | null;
  isActive: boolean;
  visibleReviewCount: number;
  averageRating: number | null;
  hasApiCredentials: boolean;
  settings: Record<string, unknown>;
  createdAt: string | null;
  updatedAt: string | null;
}

/** External review (single review from Google/Trustpilot). */
export interface AdminExternalReviewDTO {
  id: string;
  providerReviewId: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  rating: number | null;
  content: string | null;
  language: string | null;
  countryCode: string | null;
  publishedAt: string | null;
  permalink: string | null;
  isVisible: boolean;
  syncedAt: string | null;
  provider: string | null;
  providerDisplayName: string | null;
  reviewSourceId: string | null;
  hasTestimonial: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateReviewSourceDTO {
  provider: 'google' | 'trustpilot' | 'other';
  displayName: string;
  locationId?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  syncFrequencyMinutes?: number;
  isActive?: boolean;
}

export interface UpdateReviewSourceDTO {
  displayName?: string;
  locationId?: string | null;
  apiKey?: string | null;
  apiSecret?: string | null;
  syncFrequencyMinutes?: number;
  isActive?: boolean;
}

export interface UpdateExternalReviewDTO {
  isVisible?: boolean;
}

/** Admin view of a curated testimonial (manual or promoted from external review). */
export interface AdminTestimonialDTO {
  id: string;
  publicId: string;
  slug: string;
  authorName: string;
  authorRole: string | null;
  authorAvatarUrl: string | null;
  quote: string;
  rating: number | null;
  sourceType: string;
  sourceLabel: string | null;
  sourceUrl: string | null;
  locale: string | null;
  isFeatured: boolean;
  displayOrder: number | null;
  published: boolean;
  publishedAt: string | null;
  featuredAt: string | null;
  badges: unknown[];
  metadata: Record<string, unknown>;
  externalReviewId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/** Payload to create a testimonial (admin-added review). Backend expects snake_case. */
export interface CreateTestimonialDTO {
  authorName: string;
  authorRole?: string | null;
  quote: string;
  rating?: number | null;
  sourceType?: 'manual' | 'other';
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  locale?: string | null;
  published?: boolean;
}

/** Payload to update a testimonial. Backend expects snake_case. */
export interface UpdateTestimonialDTO {
  authorName?: string;
  authorRole?: string | null;
  quote?: string;
  rating?: number | null;
  sourceLabel?: string | null;
  sourceUrl?: string | null;
  locale?: string | null;
  published?: boolean;
}
