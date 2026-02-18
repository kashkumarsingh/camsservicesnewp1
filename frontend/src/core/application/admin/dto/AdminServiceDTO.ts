/**
 * Admin Service DTO (Application Layer)
 *
 * Clean Architecture Layer: Application (DTO)
 * Purpose: Defines the shape of Service data for admin dashboard
 * Location: frontend/src/core/application/admin/dto/AdminServiceDTO.ts
 *
 * This DTO is used exclusively for admin operations (listing, creating, editing services)
 */

export interface AdminServiceDTO {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  description: string | null;
  body: string | null;
  hero: Record<string, any> | null;
  contentSection: Record<string, any> | null;
  ctaSection: Record<string, any> | null;
  icon: string | null;
  category: string | null;
  views: number;
  published: boolean;
  publishAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

/**
 * DTO for creating/updating services (request payload)
 */
export interface CreateServiceDTO {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  body?: string;
  hero?: Record<string, any>;
  contentSection?: Record<string, any>;
  ctaSection?: Record<string, any>;
  icon?: string;
  category?: string;
  published?: boolean;
  publishAt?: string;
}

export interface UpdateServiceDTO extends Partial<CreateServiceDTO> {}
