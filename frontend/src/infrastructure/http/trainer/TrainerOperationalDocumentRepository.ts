import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import { downloadAuthenticatedFile } from '../downloadAuthenticatedFile';
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
  file_name: string;
  version: string;
  updated_at?: string;
}

export class TrainerOperationalDocumentRepository {
  async list(): Promise<TrainerOperationalDocumentItem[]> {
    const response = await apiClient.get<{ documents: TrainerOperationalDocumentItem[] }>(
      API_ENDPOINTS.TRAINER_OPERATIONAL_DOCUMENTS
    );
    return response.data?.documents ?? [];
  }

  async download(id: number, fileName: string): Promise<void> {
    await downloadAuthenticatedFile(API_ENDPOINTS.TRAINER_OPERATIONAL_DOCUMENT_DOWNLOAD(id), fileName);
  }
}

export const trainerOperationalDocumentRepository = new TrainerOperationalDocumentRepository();
