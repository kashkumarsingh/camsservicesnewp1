/**
 * Admin page DTOs.
 *
 * Backend API returns: id, title, slug, status, metaTitle, metaDescription, ogImage,
 * isSystem, publishedAt, updatedAt, createdAt.
 */

export interface RemotePageResponse {
  id: string;
  title: string;
  slug: string;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  isSystem?: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
}

export interface RemotePagesListResponse {
  data: RemotePageResponse[];
}

export interface AdminPageDTO {
  id: string;
  title: string;
  slug: string;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogImage?: string | null;
  isSystem?: boolean;
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
  /** Derived for UI: published = (status === 'published'). */
  published: boolean;
  /** Alias for updatedAt for list display. */
  lastUpdated?: string | null;
}

export interface CreatePageDTO {
  title: string;
  slug: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface UpdatePageDTO {
  title?: string;
  slug?: string;
  status?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
}

export interface TogglePublishDTO {
  published: boolean;
}

export interface AdminPagesFilters {
  status?: string;
}

export function mapRemotePageToAdminPageDTO(remote: RemotePageResponse): AdminPageDTO {
  return {
    id: remote.id,
    title: remote.title,
    slug: remote.slug,
    status: remote.status,
    metaTitle: remote.metaTitle ?? null,
    metaDescription: remote.metaDescription ?? null,
    ogImage: remote.ogImage ?? null,
    isSystem: remote.isSystem ?? false,
    publishedAt: remote.publishedAt ?? null,
    updatedAt: remote.updatedAt ?? null,
    createdAt: remote.createdAt ?? null,
    published: remote.status === 'published',
    lastUpdated: remote.updatedAt ?? null,
  };
}
