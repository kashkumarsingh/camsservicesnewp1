import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { extractList } from '@/infrastructure/http/responseHelpers';
import { IPageRepository } from '@/core/application/pages/ports/IPageRepository';
import { Page } from '@/core/domain/pages/entities/Page';
import { CACHE_TAGS, REVALIDATION_TIMES } from '@/shared/utils/revalidationConstants';

/** API response shape (backend sends camelCase). */
interface RemotePageResponse {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: string;
  status?: string;
  publishedAt?: string;
  /** Legacy fields (optional for backward compatibility). */
  type?: string;
  /** Rich text (legacy) or structured content (Public Pages Content Management JSON). */
  content?: string | Record<string, unknown>;
  sections?: Array<{ type: string; data: Record<string, unknown> }>;
  lastUpdated?: string;
  effectiveDate?: string;
  version?: string;
  views?: number;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Note: ApiClient unwraps { success: true, data: [...] } to { data: [...] }
// So we expect the unwrapped response directly
interface PageListResponse {
  success: boolean;
  data: RemotePageResponse[];
}

interface PageSingleResponse {
  success: boolean;
  data: RemotePageResponse;
}

export class ApiPageRepository implements IPageRepository {
  private toDomain(data: RemotePageResponse): Page {
    const published = data.status === 'published' || data.published === true;
    const contentRaw = data.content;
    const contentString = typeof contentRaw === 'string' ? contentRaw : '';
    const structuredContent =
      typeof contentRaw === 'object' && contentRaw !== null && !Array.isArray(contentRaw)
        ? (contentRaw as Record<string, unknown>)
        : undefined;
    return Page.create({
      id: data.id,
      title: data.title,
      slug: data.slug,
      type: data.type ?? 'other',
      summary: data.summary ?? data.metaDescription,
      content: contentString,
      sections: data.sections,
      structuredContent,
      lastUpdated: data.lastUpdated,
      effectiveDate: data.effectiveDate,
      version: data.version ?? '1.0.0',
      views: data.views ?? 0,
      published,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }

  async findBySlug(slug: string): Promise<Page | null> {
    const isServerSide = typeof window === 'undefined';
    const requestOptions: RequestInit | undefined = isServerSide
      ? {
          next: {
            revalidate: REVALIDATION_TIMES.CONTENT_PAGE,
            tags: [CACHE_TAGS.PAGES, CACHE_TAGS.PAGE_SLUG(slug)],
          },
        }
      : {
          cache: 'no-store',
        };

    try {
      // ApiClient unwraps { success: true, data: {...} } to { data: {...} }
      // So response.data is already the RemotePageResponse, not PageSingleResponse
      // Use centralized timeout utility for consistent error handling
      const { createTimeoutPromise } = await import('@/marketing/utils/promiseUtils');
      const response = await Promise.race([
        apiClient.get<RemotePageResponse>(API_ENDPOINTS.PAGE_BY_SLUG(slug), requestOptions),
        createTimeoutPromise(5000, `Page fetch timeout for slug: ${slug}`),
      ]);
      
      // Check if response has data and is a plain object (not error envelope or string)
      const raw = response.data;
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        console.error(`Invalid API response for page "${slug}":`, response);
        return null;
      }
      
      // Check if it's an error response (ApiClient might not unwrap error responses)
      if ('success' in raw && raw.success === false) {
        console.warn(`Page "${slug}" not found or error:`, (raw as { message?: string }).message);
        return null;
      }
      
      // Require minimal fields so toDomain does not throw
      if (typeof (raw as RemotePageResponse).title !== 'string' || typeof (raw as RemotePageResponse).slug !== 'string') {
        console.error(`Page "${slug}" response missing title/slug:`, raw);
        return null;
      }
      
      return this.toDomain(raw as RemotePageResponse);
    } catch (error: unknown) {
      // Handle timeout errors gracefully - return null instead of throwing
      const err = error as { message?: string; code?: string; status?: number; response?: { status?: number } };
      if (err.message?.includes('timeout') || err.code === 'TIMEOUT' || err.message?.includes('Page fetch timeout')) {
        console.warn(`[ApiPageRepository] Request timed out for page "${slug}", returning null`);
        return null;
      }

      // Treat 4xx (404, 400, etc.) as "page not found" so build and runtime can continue (notFound() / 404)
      const status = err.status ?? err.response?.status;
      if (status != null && status >= 400 && status < 500) {
        console.warn(`[ApiPageRepository] Page "${slug}" returned ${status}, returning null`);
        return null;
      }

      // Log the error for debugging (only non-timeout, non-4xx errors)
      console.error(`Error fetching page "${slug}":`, error);

      throw new Error(
        `Failed to fetch page "${slug}": ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async findAll(): Promise<Page[]> {
    const isServerSide = typeof window === 'undefined';
    const requestOptions: RequestInit | undefined = isServerSide
      ? {
          next: {
            revalidate: REVALIDATION_TIMES.CONTENT_PAGE,
            tags: [CACHE_TAGS.PAGES],
          },
        }
      : {
          cache: 'no-store',
        };

    // ApiClient unwraps { success: true, data: [...] } to { data: [...] } or { data: { data: [...], meta } }
    const response = await apiClient.get<RemotePageResponse[] | { data: RemotePageResponse[]; meta?: unknown }>(API_ENDPOINTS.PAGES, requestOptions);
    const pages = extractList(response);
    return pages.map((page) => this.toDomain(page));
  }
}


