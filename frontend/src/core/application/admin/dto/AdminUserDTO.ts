/**
 * Admin User DTOs (Application Layer)
 * 
 * Clean Architecture: Application Layer - Data Transfer Objects
 * Purpose: Type-safe data structures for admin user management
 */

export interface AdminUserDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  postcode?: string | null;
  role: 'parent' | 'trainer' | 'admin' | 'super_admin' | 'editor';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: string | null;
  rejectionReason?: string | null;
  rejectedAt?: string | null;
  registrationSource?: string | null;
  childrenCount?: number;
  approvedChildrenCount?: number;
  bookingsCount?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  postcode?: string;
  role: 'parent' | 'trainer' | 'admin' | 'super_admin' | 'editor';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
  postcode?: string;
  role?: 'parent' | 'trainer' | 'admin' | 'super_admin' | 'editor';
  approvalStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ApproveUserDTO {
  id: string;
}

export interface RejectUserDTO {
  id: string;
  reason?: string;
}

/**
 * Remote backend response type (snake_case from Laravel)
 */
export interface RemoteAdminUserResponse {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  postcode?: string | null;
  role: string;
  approvalStatus?: string | null;
  approval_status?: string | null;
  approvedAt?: string | null;
  approved_at?: string | null;
  rejectionReason?: string | null;
  rejection_reason?: string | null;
  rejectedAt?: string | null;
  rejected_at?: string | null;
  registrationSource?: string | null;
  registration_source?: string | null;
  childrenCount?: number;
  approvedChildrenCount?: number;
  bookingsCount?: number;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

/**
 * Map remote response to DTO
 */
export function mapRemoteUserToDTO(remote: RemoteAdminUserResponse): AdminUserDTO {
  return {
    id: String(remote.id),
    name: remote.name,
    email: remote.email,
    phone: remote.phone ?? null,
    address: remote.address ?? null,
    postcode: remote.postcode ?? null,
    role: remote.role as AdminUserDTO['role'],
    approvalStatus: (remote.approvalStatus ?? remote.approval_status ?? 'pending') as AdminUserDTO['approvalStatus'],
    approvedAt: remote.approvedAt ?? remote.approved_at ?? null,
    rejectionReason: remote.rejectionReason ?? remote.rejection_reason ?? null,
    rejectedAt: remote.rejectedAt ?? remote.rejected_at ?? null,
    registrationSource: remote.registrationSource ?? remote.registration_source ?? null,
    childrenCount: remote.childrenCount,
    approvedChildrenCount: remote.approvedChildrenCount,
    bookingsCount: remote.bookingsCount,
    createdAt: remote.createdAt ?? remote.created_at ?? null,
    updatedAt: remote.updatedAt ?? remote.updated_at ?? null,
  };
}
