/**
 * Admin Trainer DTOs (Application Layer)
 *
 * Clean Architecture: Application Layer
 * Purpose: Data Transfer Objects for admin trainer management
 * Location: frontend/src/core/application/admin/dto/AdminTrainerDTO.ts
 *
 * These DTOs define the shape of trainer data exchanged between:
 * - Frontend UI (Presentation Layer)
 * - Backend API (Infrastructure Layer)
 *
 * Naming Convention: "Remote" = from backend API (CMS-agnostic)
 */

import type { TrainerCertification } from '@/core/application/trainer/types';

// ========== Remote API Response Types (from backend) ==========

export interface RemoteTrainerActivity {
  id: string;
  name: string;
  slug?: string;
  isPrimary: boolean;
}

export interface RemoteTrainerResponse {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  email?: string;
  role?: string;
  bio?: string;
  fullDescription?: string;
  image?: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  excludedActivityIds?: string[];
  exclusionReason?: string;
  certifications: Array<TrainerCertification | string>;
  experienceYears?: number;
  availabilityNotes?: string;
  homePostcode?: string;
  travelRadiusKm?: number;
  serviceAreaPostcodes: string[];
  preferredAgeGroups: string[];
  availabilityPreferences?: Record<string, unknown>;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  activities: RemoteTrainerActivity[];
  userApprovalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RemoteTrainersListResponse {
  data: RemoteTrainerResponse[];
  meta?: {
    limit: number;
    offset: number;
    total_count: number;
  };
}

// ========== Frontend DTOs (for UI consumption) ==========

export interface AdminTrainerDTO {
  id: string;
  userId: string | null;
  name: string;
  slug: string;
  email?: string;
  role?: string;
  bio?: string;
  fullDescription?: string;
  image?: string;
  rating: number;
  totalReviews: number;
  specialties: string[];
  excludedActivityIds?: string[];
  exclusionReason?: string;
  certifications: TrainerCertification[];
  experienceYears?: number;
  availabilityNotes?: string;
  homePostcode?: string;
  travelRadiusKm?: number;
  serviceAreaPostcodes: string[];
  preferredAgeGroups: string[];
  availabilityPreferences?: Record<string, unknown>;
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  activities: RemoteTrainerActivity[];
  userApprovalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrainerDTO {
  name: string;
  email: string;
  password: string;
  role?: string;
  bio?: string;
  full_description?: string;
  image?: string;
  specialties?: string[];
  certifications?: TrainerCertification[] | string[];
  experience_years?: number;
  home_postcode?: string;
  travel_radius_km?: number;
  service_area_postcodes?: string[];
  preferred_age_groups?: string[];
  is_active?: boolean;
  activity_ids?: string[];
}

export interface UpdateTrainerDTO {
  name?: string;
  role?: string;
  bio?: string;
  full_description?: string;
  image?: string;
  specialties?: string[];
  certifications?: TrainerCertification[] | string[];
  experience_years?: number;
  home_postcode?: string;
  travel_radius_km?: number;
  service_area_postcodes?: string[];
  preferred_age_groups?: string[];
  is_active?: boolean;
  is_featured?: boolean;
  activity_ids?: string[];
}

export interface ActivateTrainerDTO {
  is_active: boolean;
}

export interface AdminTrainersFilters {
  is_active?: boolean;
  has_certifications?: boolean;
  service_region?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// ========== Mapper Functions (Remote → Frontend) ==========

export function mapRemoteTrainerToAdminTrainerDTO(
  remote: RemoteTrainerResponse
): AdminTrainerDTO {
  const normalizedCertifications: TrainerCertification[] = (remote.certifications ?? []).map(
    (cert, index) => {
      if (typeof cert === 'string') {
        return {
          id: `${remote.id}-cert-${index}`,
          name: cert,
        };
      }

      return {
        id: cert.id ?? `${remote.id}-cert-${index}`,
        name: cert.name,
        year: cert.year ?? null,
        issuer: cert.issuer ?? null,
        file_path: cert.file_path ?? null,
        file_url: cert.file_url ?? null,
        uploaded_at: cert.uploaded_at ?? null,
        expiry_date: cert.expiry_date ?? null,
      };
    }
  );

  return {
    id: remote.id,
    userId: remote.userId,
    name: remote.name,
    slug: remote.slug,
    email: remote.email,
    role: remote.role,
    bio: remote.bio,
    fullDescription: remote.fullDescription,
    image: remote.image,
    rating: remote.rating,
    totalReviews: remote.totalReviews,
    specialties: remote.specialties,
    excludedActivityIds: remote.excludedActivityIds,
    exclusionReason: remote.exclusionReason,
    certifications: normalizedCertifications,
    experienceYears: remote.experienceYears,
    availabilityNotes: remote.availabilityNotes,
    homePostcode: remote.homePostcode,
    travelRadiusKm: remote.travelRadiusKm,
    serviceAreaPostcodes: remote.serviceAreaPostcodes,
    preferredAgeGroups: remote.preferredAgeGroups,
    availabilityPreferences: remote.availabilityPreferences,
    isActive: remote.isActive,
    isFeatured: remote.isFeatured,
    views: remote.views,
    activities: remote.activities,
    userApprovalStatus: remote.userApprovalStatus,
    createdAt: remote.createdAt,
    updatedAt: remote.updatedAt,
  };
}
