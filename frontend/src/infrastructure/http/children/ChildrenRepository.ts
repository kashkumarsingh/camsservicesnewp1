/**
 * Children Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for children API calls
 * Location: frontend/src/infrastructure/http/children/ChildrenRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type { Child, CreateChildRequest, ChildChecklistRequest } from '@/core/application/auth/types';
import { getChildChecklistFlags } from '@/core/application/auth/types';

/** Raw child shape from API (may be snake_case or camelCase). */
type RemoteChild = Record<string, unknown> & {
  id?: number;
  user_id?: number;
  name?: string;
  age?: number;
  approval_status?: string;
  approvalStatus?: string;
  has_checklist?: boolean;
  hasChecklist?: boolean;
  checklist_completed?: boolean;
  checklistCompleted?: boolean;
  [key: string]: unknown;
};

function normaliseChildFromApi(raw: RemoteChild): Child {
  const flags = getChildChecklistFlags(raw);
  return {
    id: Number(raw.id),
    user_id: Number((raw as { user_id?: number }).user_id ?? (raw as { userId?: number }).userId ?? 0),
    name: String(raw.name ?? ''),
    age: Number(raw.age),
    date_of_birth: raw.date_of_birth != null ? String(raw.date_of_birth) : (raw as { dateOfBirth?: string }).dateOfBirth != null ? String((raw as { dateOfBirth: string }).dateOfBirth) : undefined,
    gender: (raw.gender ?? (raw as { gender?: string }).gender) as Child['gender'],
    address: raw.address != null ? String(raw.address) : undefined,
    postcode: raw.postcode != null ? String(raw.postcode) : undefined,
    city: raw.city != null ? String(raw.city) : undefined,
    region: raw.region != null ? String(raw.region) : undefined,
    approval_status: (flags.approvalStatus || raw.approval_status || (raw as { approvalStatus?: string }).approvalStatus || 'pending') as Child['approval_status'],
    approved_at: (raw.approved_at ?? (raw as { approvedAt?: string }).approvedAt) as string | undefined,
    rejected_at: (raw.rejected_at ?? (raw as { rejectedAt?: string }).rejectedAt) as string | undefined,
    rejection_reason: (raw.rejection_reason ?? (raw as { rejectionReason?: string }).rejectionReason) as string | undefined,
    has_checklist: flags.hasChecklist,
    checklist_completed: flags.checklistCompleted,
    created_at: String(raw.created_at ?? (raw as { createdAt?: string }).createdAt ?? ''),
    can_archive: raw.can_archive as boolean | undefined ?? (raw as { canArchive?: boolean }).canArchive,
    can_delete: raw.can_delete as boolean | undefined ?? (raw as { canDelete?: boolean }).canDelete,
  };
}

export class ChildrenRepository {
  /**
   * Get all children for authenticated user.
   * Normalises response to Child[] (snake_case) and supports both snake_case and camelCase from the API.
   */
  async list(): Promise<Child[]> {
    // ApiClient unwraps: backend { success, data: { children } } -> response.data may be { data: { children }, meta } or { children }
    const response = await apiClient.get<{ children?: RemoteChild[]; data?: { children?: RemoteChild[] } }>(
      API_ENDPOINTS.CHILDREN
    );

    const data = response.data as { children?: RemoteChild[]; data?: { children?: RemoteChild[] }; meta?: unknown };
    const children = Array.isArray(data?.children) ? data.children : Array.isArray(data?.data?.children) ? data.data.children : undefined;

    if (!Array.isArray(children)) {
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
         
        console.warn(
          '[ChildrenRepository] Unexpected children payload shape:',
          response.data
        );
      }
      return [];
    }

    return children.map(normaliseChildFromApi);
  }

  /**
   * Get a specific child
   */
  async get(id: number): Promise<Child> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { child: {...} } }
    // ApiClient returns: { data: { child: {...} } }
    const response = await apiClient.get<{ child: Child }>(
      API_ENDPOINTS.CHILD_BY_ID(id)
    );
    
    return response.data.child;
  }

  /**
   * Create a new child
   */
  async create(data: CreateChildRequest): Promise<Child> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { child: {...} } }
    // ApiClient returns: { data: { child: {...} } }
    const response = await apiClient.post<{ child: Child }>(
      API_ENDPOINTS.CHILDREN,
      data
    );
    
    return response.data.child;
  }

  /**
   * Update a child
   */
  async update(id: number, data: Partial<CreateChildRequest>): Promise<Child> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { child: {...} } }
    // ApiClient returns: { data: { child: {...} } }
    const response = await apiClient.put<{ child: Child }>(
      API_ENDPOINTS.CHILD_BY_ID(id),
      data
    );
    
    return response.data.child;
  }

  /**
   * Delete a child
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.CHILD_BY_ID(id));
  }

  /**
   * Get checklist for a child
   */
  async getChecklist(childId: number): Promise<ChildChecklistRequest> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { checklist: {...} } }
    // ApiClient returns: { data: { checklist: {...} } }
    const response = await apiClient.get<{ checklist: ChildChecklistRequest }>(
      API_ENDPOINTS.CHILD_CHECKLIST(childId)
    );
    
    return response.data.checklist;
  }

  /**
   * Create or update checklist for a child
   */
  async saveChecklist(childId: number, data: ChildChecklistRequest): Promise<ChildChecklistRequest> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { checklist: {...} } }
    // ApiClient returns: { data: { checklist: {...} } }
    // Try PUT first (update), fallback to POST (create)
    try {
      const response = await apiClient.put<{ checklist: ChildChecklistRequest }>(
        API_ENDPOINTS.CHILD_CHECKLIST(childId),
        data
      );
      return response.data.checklist;
    } catch (err: any) {
      // If PUT fails (e.g., checklist doesn't exist), try POST
      if (err.response?.status === 404 || err.response?.status === 405) {
        const response = await apiClient.post<{ checklist: ChildChecklistRequest }>(
          API_ENDPOINTS.CHILD_CHECKLIST(childId),
          data
        );
        return response.data.checklist;
      }
      throw err;
    }
  }
}

export const childrenRepository = new ChildrenRepository();

