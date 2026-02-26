import { apiClient } from '@/infrastructure/http/ApiClient';
import { API_ENDPOINTS } from '@/infrastructure/http/apiEndpoints';
import { extractList } from '@/infrastructure/http/responseHelpers';
import { IPageRepository } from '@/core/application/pages/ports/IPageRepository';
import { Page } from '@/core/domain/pages/entities/Page';
import { CACHE_TAGS, REVALIDATION_TIMES } from '@/utils/revalidationConstants';

/** API response shape (backend sends camelCase via ApiResponseHelper). */
interface RemotePageResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  summary?: string;
  content: string;
  sections?: Array<{ type: string; data: Record<string, unknown> }>;
  blocks?: Array<{
    id?: string;
    type: string;
    payload: Record<string, unknown>;
    meta?: { visibleFrom?: string | null; visibleUntil?: string | null; hideOnMobile?: boolean | null } | null;
  }>;
  lastUpdated?: string;
  effectiveDate?: string;
  version: string;
  views: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  mission?: { title?: string; description?: string } | null;
  coreValues?: Array<{ icon?: string; title: string; description: string }> | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: { title?: string; subtitle?: string; description?: string; badges?: string[] } | null;
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
    return Page.create({
      id: data.id,
      title: data.title,
      slug: data.slug,
      type: data.type,
      summary: data.summary,
      content: data.content,
      sections: data.sections,
      blocks: data.blocks,
      lastUpdated: data.lastUpdated,
      effectiveDate: data.effectiveDate,
      version: data.version,
      views: data.views,
      published: data.published,
      mission: data.mission ?? undefined,
      coreValues: data.coreValues ?? undefined,
      coreValuesSectionTitle: data.coreValuesSectionTitle ?? undefined,
      coreValuesSectionSubtitle: data.coreValuesSectionSubtitle ?? undefined,
      safeguarding: data.safeguarding ?? undefined,
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
      const { createTimeoutPromise } = await import('@/utils/promiseUtils');
      const response = await Promise.race([
        apiClient.get<RemotePageResponse>(API_ENDPOINTS.PAGE_BY_SLUG(slug), requestOptions),
        createTimeoutPromise(5000, `Page fetch timeout for slug: ${slug}`),
      ]);
      
      // Check if response has data
      if (!response.data) {
        console.error(`Invalid API response for page "${slug}":`, response);
        return null;
      }
      
      // Check if it's an error response (ApiClient might not unwrap error responses)
      if ('success' in response.data && response.data.success === false) {
        console.warn(`Page "${slug}" not found or error:`, (response.data as any).message);
        return null;
      }
      
      return this.toDomain(response.data);
    } catch (error: any) {
      // Handle timeout errors gracefully - return null instead of throwing
      if (error.message?.includes('timeout') || error.code === 'TIMEOUT' || error.message?.includes('Page fetch timeout')) {
        console.warn(`[ApiPageRepository] Request timed out for page "${slug}", returning null`);
        return null;
      }
      
      // Handle 404 errors gracefully
      if (error?.status === 404 || error?.response?.status === 404) {
        return null;
      }
      
      // Log the error for debugging (only non-timeout errors)
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


