/**
 * Admin Page DTOs (Application Layer)
 *
 * Clean Architecture: Application Layer
 * Purpose: Data Transfer Objects for admin public pages management
 * Location: frontend/src/core/application/admin/dto/AdminPageDTO.ts
 *
 * These DTOs define the shape of page data exchanged between:
 * - Frontend UI (Presentation Layer)
 * - Backend API (Infrastructure Layer)
 *
 * Naming Convention: "Remote" = from backend API (CMS-agnostic)
 */

import type { AdminPageBlockDTO } from '@/core/application/pages/dto/PageDTO';

// ========== About page section types (for type === 'about') ==========

export interface AboutMissionDTO {
  title?: string;
  description?: string;
}

export interface AboutCoreValueDTO {
  icon?: string;
  title: string;
  description: string;
}

export interface AboutSafeguardingDTO {
  title?: string;
  subtitle?: string;
  description?: string;
  badges?: string[];
}

// ========== Remote API Response Types (from backend) ==========

export interface RemotePageResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  content?: string;
  summary?: string;
  published: boolean;
  lastUpdated?: string;
  effectiveDate?: string;
  version: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
  blocks?: AdminPageBlockDTO[];
  mission?: AboutMissionDTO | null;
  coreValues?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}

export interface RemotePagesListResponse {
  data: RemotePageResponse[];
}

// ========== Frontend DTOs (for UI consumption) ==========

export interface AdminPageDTO {
  id: string;
  title: string;
  slug: string;
  type: string;
  content?: string;
  summary?: string;
  published: boolean;
  lastUpdated?: string;
  effectiveDate?: string;
  version: string;
  views: number;
  createdAt?: string;
  updatedAt?: string;
  blocks?: AdminPageBlockDTO[];
  mission?: AboutMissionDTO | null;
  coreValues?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}

export interface CreatePageDTO {
  title: string;
  slug: string;
  type: string;
  content: string;
  summary?: string;
  effective_date?: string;
  version?: string;
  published?: boolean;
  mission?: AboutMissionDTO | null;
  core_values?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}

export interface UpdatePageDTO {
  title?: string;
  slug?: string;
  type?: string;
  content?: string;
  summary?: string;
  effective_date?: string;
  version?: string;
  published?: boolean;
  mission?: AboutMissionDTO | null;
  core_values?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}

export interface TogglePublishDTO {
  published: boolean;
}

export interface AdminPagesFilters {
  type?: string;
  published?: boolean;
}

// ========== Page Type Options ==========

export const PAGE_TYPES = {
  HOME: 'home',
  ABOUT: 'about',
  PRIVACY_POLICY: 'privacy-policy',
  TERMS_OF_SERVICE: 'terms-of-service',
  CANCELLATION_POLICY: 'cancellation-policy',
  COOKIE_POLICY: 'cookie-policy',
  PAYMENT_REFUND_POLICY: 'payment-refund-policy',
  SAFEGUARDING_POLICY: 'safeguarding-policy',
  OTHER: 'other',
} as const;

export const PAGE_TYPE_LABELS: Record<string, string> = {
  [PAGE_TYPES.HOME]: 'Home',
  [PAGE_TYPES.ABOUT]: 'About',
  [PAGE_TYPES.PRIVACY_POLICY]: 'Privacy Policy',
  [PAGE_TYPES.TERMS_OF_SERVICE]: 'Terms of Service',
  [PAGE_TYPES.CANCELLATION_POLICY]: 'Cancellation Policy',
  [PAGE_TYPES.COOKIE_POLICY]: 'Cookie Policy',
  [PAGE_TYPES.PAYMENT_REFUND_POLICY]: 'Payment & Refund Policy',
  [PAGE_TYPES.SAFEGUARDING_POLICY]: 'Safeguarding Policy',
  [PAGE_TYPES.OTHER]: 'Other',
};

// ========== Mapper Functions (Remote → Frontend) ==========

export function mapRemotePageToAdminPageDTO(remote: RemotePageResponse): AdminPageDTO {
  return {
    id: remote.id,
    title: remote.title,
    slug: remote.slug,
    type: remote.type,
    content: remote.content,
    summary: remote.summary,
    published: remote.published,
    lastUpdated: remote.lastUpdated,
    effectiveDate: remote.effectiveDate,
    version: remote.version,
    views: remote.views,
    createdAt: remote.createdAt,
    updatedAt: remote.updatedAt,
    blocks: remote.blocks ?? undefined,
    mission: remote.mission ?? undefined,
    coreValues: remote.coreValues ?? undefined,
    coreValuesSectionTitle: remote.coreValuesSectionTitle ?? undefined,
    coreValuesSectionSubtitle: remote.coreValuesSectionSubtitle ?? undefined,
    safeguarding: remote.safeguarding ?? undefined,
  };
}
