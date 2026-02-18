/**
 * Admin Activity DTOs (Application Layer)
 *
 * Clean Architecture Layer: Application (DTO)
 * Purpose: Defines the shape of Activity data for the admin dashboard.
 * Location: frontend/src/core/application/admin/dto/AdminActivityDTO.ts
 */

export interface AdminActivityDTO {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  duration: number | null;
  isActive: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateActivityDTO {
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  duration: number;
  isActive?: boolean;
}

export interface UpdateActivityDTO extends Partial<CreateActivityDTO> {}

/**
 * Remote response type from backend admin activities API.
 */
export interface RemoteAdminActivityResponse {
  id: string | number;
  name: string;
  slug: string;
  category?: string | null;
  description?: string | null;
  duration?: number | string | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export function mapRemoteActivityToDTO(remote: RemoteAdminActivityResponse): AdminActivityDTO {
  return {
    id: String(remote.id),
    name: remote.name,
    slug: remote.slug,
    category: remote.category ?? null,
    description: remote.description ?? null,
    duration:
      remote.duration === null || remote.duration === undefined
        ? null
        : Number.parseFloat(String(remote.duration)),
    isActive: Boolean(remote.isActive ?? true),
    createdAt: remote.createdAt ?? null,
    updatedAt: remote.updatedAt ?? null,
  };
}

