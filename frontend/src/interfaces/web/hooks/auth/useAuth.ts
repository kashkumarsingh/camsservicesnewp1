/**
 * useAuth Hook
 *
 * Clean Architecture: Interface Layer
 * Purpose: React hook for authentication state management. Consumes AuthContext so
 * GET /auth/user is called once per app load (single source of truth).
 * Location: frontend/src/interfaces/web/hooks/auth/useAuth.ts
 */

'use client';

import {
  useAuthContext,
  AuthProvider,
  type AuthLoadError,
  type UnauthenticatedReason,
} from '@/interfaces/web/hooks/auth/AuthContext';

// Re-export for consumers that import types from useAuth
export type { AuthLoadError, UnauthenticatedReason };
export { AuthProvider };

export function useAuth() {
  return useAuthContext();
}
