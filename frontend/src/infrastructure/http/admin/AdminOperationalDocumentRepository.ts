import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import { downloadAuthenticatedFile } from '../downloadAuthenticatedFile';
import type {
  OperationalDocumentAudience,
  OperationalDocumentCategory,
} from '@/dashboard/utils/operationalDocumentConstants';

export interface OperationalDocumentItem {
  id: number;
  slug: string;
  title: string;
  category: OperationalDocumentCategory;
  audience: OperationalDocumentAudience;
  fileName: string;
  mimeType?: string;
  version: string;
  isPublished?: boolean;
  internalOnly?: boolean;
  externalUrl?: string | null;
  hasDownload?: boolean;
  uploadedByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UploadOperationalDocumentInput {
  file: File;
  title: string;
  category: OperationalDocumentCategory;
  audience: OperationalDocumentAudience;
  version?: string;
  slug?: string;
  isPublished?: boolean;
  externalUrl?: string;
}

export interface UpdateOperationalDocumentInput {
  title?: string;
  category?: OperationalDocumentCategory;
  audience?: OperationalDocumentAudience;
  version?: string;
  isPublished?: boolean;
  externalUrl?: string;
}

export class AdminOperationalDocumentRepository {
  async list(category?: string): Promise<OperationalDocumentItem[]> {
    const params = category ? { category } : undefined;
    const response = await apiClient.get<{ documents: OperationalDocumentItem[] }>(
      API_ENDPOINTS.ADMIN_OPERATIONAL_DOCUMENTS,
      params ? { params: params as Record<string, string> } : undefined
    );
    return response.data?.documents ?? [];
  }

  async upload(input: UploadOperationalDocumentInput): Promise<OperationalDocumentItem> {
    const formData = new FormData();
    formData.append('file', input.file);
    formData.append('title', input.title);
    formData.append('category', input.category);
    formData.append('audience', input.audience);
    if (input.version) formData.append('version', input.version);
    if (input.slug) formData.append('slug', input.slug);
    if (input.isPublished != null) {
      formData.append('is_published', input.isPublished ? '1' : '0');
    }
    if (input.externalUrl) {
      formData.append('external_url', input.externalUrl);
    }

    const response = await apiClient.post<{ document: OperationalDocumentItem }>(
      API_ENDPOINTS.ADMIN_OPERATIONAL_DOCUMENTS,
      formData
    );
    return response.data.document;
  }

  async update(id: number, input: UpdateOperationalDocumentInput): Promise<OperationalDocumentItem> {
    const payload: Record<string, unknown> = {};
    if (input.title != null) payload.title = input.title;
    if (input.category != null) payload.category = input.category;
    if (input.audience != null) payload.audience = input.audience;
    if (input.version != null) payload.version = input.version;
    if (input.isPublished != null) payload.is_published = input.isPublished;
    if (input.externalUrl !== undefined) payload.external_url = input.externalUrl;

    const response = await apiClient.put<{ document: OperationalDocumentItem }>(
      API_ENDPOINTS.ADMIN_OPERATIONAL_DOCUMENT_BY_ID(id),
      payload
    );
    return response.data.document;
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN_OPERATIONAL_DOCUMENT_BY_ID(id));
  }

  async download(id: number, fileName: string): Promise<void> {
    await downloadAuthenticatedFile(
      API_ENDPOINTS.ADMIN_OPERATIONAL_DOCUMENT_DOWNLOAD(id),
      fileName || 'document'
    );
  }
}

export const adminOperationalDocumentRepository = new AdminOperationalDocumentRepository();
