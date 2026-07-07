import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import { downloadAuthenticatedFile } from '../downloadAuthenticatedFile';
import type { LaAgreementStatus } from '@/dashboard/utils/laAgreementConstants';

export interface LocalAuthorityAgreementItem {
  id: number;
  localAuthorityName: string;
  effectiveDate?: string | null;
  expiresAt?: string | null;
  status: LaAgreementStatus | string;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  hasSignedDocument: boolean;
  signedFileName?: string | null;
  signedAt?: string | null;
  createdByName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocalAuthorityAgreementInput {
  localAuthorityName: string;
  effectiveDate?: string;
  expiresAt?: string;
  status?: LaAgreementStatus;
  contactName?: string;
  contactEmail?: string;
  notes?: string;
}

export interface UpdateLocalAuthorityAgreementInput {
  localAuthorityName?: string;
  effectiveDate?: string | null;
  expiresAt?: string | null;
  status?: LaAgreementStatus;
  contactName?: string | null;
  contactEmail?: string | null;
  notes?: string | null;
  signedAt?: string | null;
}

export class AdminLocalAuthorityAgreementRepository {
  async list(options?: {
    status?: string;
    search?: string;
    limit?: number;
  }): Promise<{ agreements: LocalAuthorityAgreementItem[]; totalCount: number }> {
    const params = new URLSearchParams();
    if (options?.status) params.set('status', options.status);
    if (options?.search) params.set('search', options.search);
    if (options?.limit) params.set('limit', String(options.limit));

    const qs = params.toString();
    const response = await apiClient.get<{
      data?: { agreements: LocalAuthorityAgreementItem[] };
      agreements?: LocalAuthorityAgreementItem[];
      meta?: { total_count?: number };
    }>(`${API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENTS}${qs ? `?${qs}` : ''}`);

    const nested = (response.data as { data?: { agreements: LocalAuthorityAgreementItem[] } })?.data;
    const agreements = nested?.agreements ?? response.data?.agreements ?? [];
    const totalCount =
      (response.data as { meta?: { total_count?: number } })?.meta?.total_count ?? agreements.length;

    return { agreements, totalCount };
  }

  async get(id: number): Promise<LocalAuthorityAgreementItem> {
    const response = await apiClient.get<{ agreement: LocalAuthorityAgreementItem }>(
      API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENT_BY_ID(id)
    );
    return response.data.agreement;
  }

  async create(input: CreateLocalAuthorityAgreementInput): Promise<LocalAuthorityAgreementItem> {
    const response = await apiClient.post<{ agreement: LocalAuthorityAgreementItem }>(
      API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENTS,
      {
        localAuthorityName: input.localAuthorityName,
        effectiveDate: input.effectiveDate,
        expiresAt: input.expiresAt,
        status: input.status ?? 'draft',
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        notes: input.notes,
      }
    );
    return response.data.agreement;
  }

  async update(
    id: number,
    input: UpdateLocalAuthorityAgreementInput
  ): Promise<LocalAuthorityAgreementItem> {
    const response = await apiClient.patch<{ agreement: LocalAuthorityAgreementItem }>(
      API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENT_BY_ID(id),
      {
        localAuthorityName: input.localAuthorityName,
        effectiveDate: input.effectiveDate,
        expiresAt: input.expiresAt,
        status: input.status,
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        notes: input.notes,
        signedAt: input.signedAt,
      }
    );
    return response.data.agreement;
  }

  async uploadSignedDocument(id: number, file: File): Promise<LocalAuthorityAgreementItem> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post<{ agreement: LocalAuthorityAgreementItem }>(
      API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENT_SIGNED_DOCUMENT(id),
      formData
    );
    return response.data.agreement;
  }

  async downloadSignedDocument(id: number, fileName: string): Promise<void> {
    await downloadAuthenticatedFile(
      API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENT_DOWNLOAD(id),
      fileName
    );
  }

  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.ADMIN_LOCAL_AUTHORITY_AGREEMENT_BY_ID(id));
  }
}

export const adminLocalAuthorityAgreementRepository =
  new AdminLocalAuthorityAgreementRepository();
