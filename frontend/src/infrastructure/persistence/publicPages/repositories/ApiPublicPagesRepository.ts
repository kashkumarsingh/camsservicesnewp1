/**
 * API Public Pages Repository
 *
 * Infrastructure implementation using the Laravel admin public pages API.
 */

import type {
  IPublicPagesRepository,
  PublicPageFilterOptions,
} from "@/core/application/publicPages/ports/IPublicPagesRepository";
import type { PublicPageDTO } from "@/core/application/publicPages/dto/PublicPageDTO";
import { apiClient } from "@/infrastructure/http/ApiClient";
import { API_ENDPOINTS } from "@/infrastructure/http/apiEndpoints";
import { extractList } from "@/infrastructure/http/responseHelpers";

interface LaravelAdminPublicPageResponse {
  id: string;
  title: string;
  slug: string;
  type: string;
  published: boolean;
  lastUpdated: string | null;
  effectiveDate: string | null;
  version: string | null;
  views: number;
}

export class ApiPublicPagesRepository implements IPublicPagesRepository {
  async list(options?: PublicPageFilterOptions): Promise<PublicPageDTO[]> {
    const params: Record<string, string> = {};

    if (options?.type) {
      params.type = options.type;
    }
    if (options?.published !== undefined) {
      params.published = String(options.published);
    }

    const query = new URLSearchParams(params).toString();
    const url = query
      ? `${API_ENDPOINTS.ADMIN_PUBLIC_PAGES}?${query}`
      : API_ENDPOINTS.ADMIN_PUBLIC_PAGES;

    const response = await apiClient.get<LaravelAdminPublicPageResponse[] | { data: LaravelAdminPublicPageResponse[]; meta?: unknown }>(url);
    const data = extractList(response);
    return data.map((page) => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      type: page.type,
      published: page.published,
      lastUpdated: page.lastUpdated,
      effectiveDate: page.effectiveDate,
      version: page.version,
      views: page.views,
    }));
  }
}

