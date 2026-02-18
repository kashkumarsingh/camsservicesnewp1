/**
 * useAuth Hook
 * 
 * Clean Architecture: Interface Layer
 * Purpose: React hook for authentication state management
 * Location: frontend/src/interfaces/web/hooks/auth/useAuth.ts
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authRepository } from '@/infrastructure/http/auth/AuthRepository';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import type { User, Child, RegisterRequest, LoginRequest } from '@/core/application/auth/types';
import { getChildChecklistFlags } from '@/core/application/auth/types';
import { getDashboardRoute, getPostAuthRedirect } from '@/utils/navigation';
import { getApiErrorMessage } from '@/utils/errorUtils';

/** Set when getCurrentUser failed with 5xx or network error (so UI can show Retry instead of redirecting to login). */
export interface AuthLoadError {
  status: number;
  message: string;
}

interface UseAuthReturn {
  user: User | null;
  children: Child[];
  approvedChildren: Child[];
  loading: boolean;
  error: string | null;
  /** Non-401/403 error from loading user (e.g. 5xx). Dashboard uses this to show Retry instead of redirect. */
  loadError: AuthLoadError | null;
  isAuthenticated: boolean;
  isApproved: boolean;
  hasApprovedChildren: boolean;
  canBook: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest, redirectUrl?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<AuthLoadError | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // Flag to prevent retries during logout
  const router = useRouter();

  // Load user and children on mount
  const loadUser = useCallback(async () => {
    // Don't load user if we're in the process of logging out
    if (isLoggingOut) {
      return;
    }

    setLoadError(null);
    const hasToken = authRepository.isAuthenticated();

    if (!hasToken) {
      setLoading(false);
      setUser(null);
      setChildren([]);
      return;
    }

    try {
      const userData = await authRepository.getCurrentUser();
      setLoadError(null);
      setUser(userData);

      // Load children only if user is a parent
      if (userData.role === 'parent') {
        try {
          const childrenData = await childrenRepository.list();
          setChildren(childrenData);
        } catch (err) {
          // Don't log 401/403 (expected if session expired); log other failures
          const status = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { status?: number } }).response?.status : undefined;
          if (status !== 401 && status !== 403) {
            console.error('[useAuth] Failed to load children:', err);
          }
          setChildren([]);
        }
      } else {
        setChildren([]); // Clear children if not a parent
      }
    } catch (err: unknown) {
      const status = typeof err === 'object' && err !== null && 'response' in err
        ? (err as { response?: { status?: number } }).response?.status
        : undefined;
      const isUnauthorized = status === 401 || status === 403;
      const hasNoResponse = status == null && (typeof err !== 'object' || err === null || !('response' in err));

      if (!isUnauthorized && !hasNoResponse) {
        const msg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null && 'response' in err && (err as { response?: { data?: { message?: unknown } } }).response?.data && typeof (err as { response: { data: { message: unknown } } }).response.data.message === 'string')
          ? (err as { response: { data: { message: string } } }).response.data.message
          : 'Unknown error';
        const code = typeof err === 'object' && err !== null && 'code' in err ? (err as { code?: string }).code : undefined;
        console.error('[useAuth] Failed to load user:', { status: status ?? 'none', message: msg, code });
      }

      if (isLoggingOut) return;

      if (isUnauthorized) {
        setLoadError(null);
        localStorage.removeItem('auth_token');
        setUser(null);
        setChildren([]);
      } else {
        setLoadError({
          status: status ?? 0,
          message: err instanceof Error ? err.message : 'Request failed',
        });
        setUser(null);
        setChildren([]);
      }
    } finally {
      setLoading(false);
    }
  }, [isLoggingOut]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const register = useCallback(async (data: RegisterRequest) => {
    setError(null);
    setLoading(true);
    try {
      const authData = await authRepository.register(data);
      setUser(authData.user);
      
      // Redirect to role-appropriate dashboard
      router.push(getDashboardRoute(authData.user));
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Registration failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const login = useCallback(async (data: LoginRequest, redirectUrl?: string | null) => {
    setError(null);
    setLoading(true);
    try {
      const authData = await authRepository.login(data);
      setUser(authData.user);
      
      // Load children after login (only for parents)
      if (authData.user.role === 'parent') {
        try {
          const childrenData = await childrenRepository.list();
          setChildren(childrenData);
        } catch (err) {
          console.error('Failed to load children:', err);
          // Don't fail auth if children load fails
        }
      }
      
      // Force router refresh to ensure all components update with new auth state
      router.refresh();
      
      // Use getPostAuthRedirect to respect redirect parameter or default to dashboard
      const targetRedirect = getPostAuthRedirect(authData.user, redirectUrl);
      
      // Use window.location for full page reload to ensure Header updates immediately
      // This ensures all components (including Header) get the fresh auth state
      window.location.href = targetRedirect;
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Login failed'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    const userId = user?.id;
    setIsLoggingOut(true);
    setLoading(true);

    localStorage.removeItem('auth_token');
    setUser(null);
    setChildren([]);
    setError(null);
    if (userId != null) {
      dashboardSyncStore.clearUser(userId);
    }

    try {
      // Try to call logout API (but don't wait for it if it fails)
      await authRepository.logout();
    } catch (err: unknown) {
      const status = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { status?: number } }).response?.status : undefined;
      if (status !== 401 && status !== 403) {
        console.error('[useAuth] Logout API error (ignored):', err);
      }
    } finally {
      setLoading(false);
      // Use window.location for full page reload to ensure clean state
      // This stops all React effects, polling, and ensures fresh start
      window.location.href = '/login';
    }
  }, []);

  const refresh = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  // Computed values
  const isAuthenticated = !!user;
  // Check parent approval status (case-insensitive for robustness)
  // Only show prices if parent is explicitly approved
  const isApproved = user?.approval_status?.toLowerCase() === 'approved';
  // Only consider children approved AND with completed checklist as "approved" for booking
  const approvedChildren = children.filter(c => {
    const { approvalStatus, hasChecklist, checklistCompleted } = getChildChecklistFlags(c);
    return approvalStatus === 'approved' && hasChecklist && checklistCompleted === true;
  });
  const hasApprovedChildren = approvedChildren.length > 0;
  const canBook = isApproved && hasApprovedChildren;

  // Debug logging for approval status (development only) - DISABLED to reduce console spam
  // Uncomment only when debugging approval issues
  // if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  //   console.log('[useAuth] Approval Debug:', {
  //     hasUser: !!user,
  //     userId: user?.id,
  //     userEmail: user?.email,
  //     approvalStatus: user?.approval_status,
  //     approvalStatusLower: user?.approval_status?.toLowerCase(),
  //     isApproved,
  //     childrenCount: children.length,
  //     approvedChildrenCount: approvedChildren.length,
  //     hasApprovedChildren,
  //     canBook,
  //     loading,
  //   });
  // }

  return {
    user,
    children,
    approvedChildren,
    loading,
    error,
    loadError,
    isAuthenticated,
    isApproved,
    hasApprovedChildren,
    canBook,
    register,
    login,
    logout,
    refresh,
  };
}

