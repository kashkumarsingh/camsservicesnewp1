import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import { downloadAuthenticatedFile } from '../downloadAuthenticatedFile';
import {
  getOperationalDocumentDownloadName,
  normalizeOperationalDocument,
} from '@/dashboard/utils/operationalDocumentUtils';
import type {
  OperationalDocumentAudience,
  OperationalDocumentCategory,
} from '@/dashboard/utils/operationalDocumentConstants';

export interface TrainerOperationalDocumentItem {
  id: number;
  slug: string;
  title: string;
  category: OperationalDocumentCategory;
  audience: OperationalDocumentAudience;
  fileName: string;
  version: string;
  updatedAt?: string;
}

export class TrainerOperationalDocumentRepository {
  async list(): Promise<TrainerOperationalDocumentItem[]> {
    const response = await apiClient.get<{ documents: TrainerOperationalDocumentItem[] }>(
      API_ENDPOINTS.TRAINER_OPERATIONAL_DOCUMENTS
    );
    return (response.data?.documents ?? []).map((doc) => normalizeOperationalDocument(doc));
  }

  async download(
    id: number,
    fileName: string | undefined,
    fallback?: Pick<TrainerOperationalDocumentItem, 'title' | 'slug'>
  ): Promise<void> {
    const resolvedName =
      fileName?.trim() && fileName.trim() !== 'undefined'
        ? fileName.trim()
        : fallback
          ? getOperationalDocumentDownloadName({ fileName: '', ...fallback })
          : 'document';

    await downloadAuthenticatedFile(
      API_ENDPOINTS.TRAINER_OPERATIONAL_DOCUMENT_DOWNLOAD(id),
      resolvedName
    );
  }
}

export const trainerOperationalDocumentRepository = new TrainerOperationalDocumentRepository();
