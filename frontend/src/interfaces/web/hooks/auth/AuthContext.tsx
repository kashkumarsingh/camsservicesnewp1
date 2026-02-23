/**
 * AuthContext & AuthProvider
 *
 * Clean Architecture: Interface Layer
 * Purpose: Single source of truth for auth state so GET /auth/user is called once per app load.
 * Location: frontend/src/interfaces/web/hooks/auth/AuthContext.tsx
 */

'use client';

import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { authRepository } from '@/infrastructure/http/auth/AuthRepository';
import { clearAuthToken } from '@/infrastructure/http/auth/authTokenProvider';
import { childrenRepository } from '@/infrastructure/http/children/ChildrenRepository';
import { dashboardSyncStore } from '@/core/dashboardSync/dashboardSyncStore';
import type { User, Child, RegisterRequest, LoginRequest } from '@/core/application/auth/types';
import { getChildChecklistFlags } from '@/core/application/auth/types';
import { getDashboardRoute, getPostAuthRedirect } from '@/utils/navigation';
import { getApiErrorMessage } from '@/utils/errorUtils';
import { USER_ROLE, APPROVAL_STATUS } from '@/utils/dashboardConstants';
import { ROUTES } from '@/utils/routes';

/** Set when getCurrentUser failed with 5xx or network error (so UI can show Retry instead of redirecting to login). */
export interface AuthLoadError {
  status: number;
  message: string;
}

/** Why the user is considered unauthenticated (for dashboard redirect and debugging). */
export type UnauthenticatedReason = 'no_token' | 'unauthorized' | null;

export interface AuthContextValue {
  user: User | null;
  children: Child[];
  approvedChildren: Child[];
  loading: boolean;
  error: string | null;
  loadError: AuthLoadError | null;
  unauthenticatedReason: UnauthenticatedReason;
  isAuthenticated: boolean;
  isApproved: boolean;
  hasApprovedChildren: boolean;
  canBook: boolean;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest, redirectUrl?: string | null) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

let hasWarnedNoTokenThisSession = false;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<AuthLoadError | null>(null);
  const [unauthenticatedReason, setUnauthenticatedReason] = useState<UnauthenticatedReason>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    if (isLoggingOut) return;

    setLoadError(null);
    let hasToken = authRepository.isAuthenticated();
    if (!hasToken) {
      await new Promise((r) => setTimeout(r, 50));
      hasToken = authRepository.isAuthenticated();
    }

    if (!hasToken) {
      setUnauthenticatedReason('no_token');
      if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development' && !hasWarnedNoTokenThisSession) {
        hasWarnedNoTokenThisSession = true;
        console.warn('[useAuth] No auth token in localStorage or cookie — not fetching user. Use the same host for login and dashboard (e.g. always http://localhost:4300, not 127.0.0.1).');
      }
      setLoading(false);
      setUser(null);
      setChildrenList([]);
      return;
    }

    try {
      let userData: User;
      try {
        userData = await authRepository.getCurrentUser();
      } catch (firstErr: unknown) {
        const firstStatus = typeof firstErr === 'object' && firstErr !== null && 'response' in firstErr
          ? (firstErr as { response?: { status?: number } }).response?.status
          : undefined;
        if ((firstStatus === 401 || firstStatus === 403) && authRepository.isAuthenticated()) {
          await new Promise((r) => setTimeout(r, 400));
          userData = await authRepository.getCurrentUser();
        } else {
          throw firstErr;
        }
      }
      setLoadError(null);
      setUnauthenticatedReason(null);
      hasWarnedNoTokenThisSession = false;
      setUser(userData);

      if (userData.role === USER_ROLE.PARENT) {
        try {
          const childrenData = await childrenRepository.list();
          setChildrenList(childrenData);
        } catch (err: unknown) {
          const status = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { status?: number } }).response?.status : undefined;
          if (status !== 401 && status !== 403) {
            console.error('[useAuth] Failed to load children:', err);
          }
          setChildrenList([]);
        }
      } else {
        setChildrenList([]);
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

      if (isUnauthorized && typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
        console.warn(
          '[useAuth] getCurrentUser() returned 401. In DevTools → Network, check the auth/user request: URL should be backend (e.g. localhost:9080) with header Authorization: Bearer <token>.'
        );
      }
      if (isUnauthorized) {
        setUnauthenticatedReason('unauthorized');
        setLoadError(null);
        clearAuthToken();
        setUser(null);
        setChildrenList([]);
      } else {
        setLoadError({
          status: status ?? 0,
          message: err instanceof Error ? err.message : 'Request failed',
        });
        setUser(null);
        setChildrenList([]);
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
      hasWarnedNoTokenThisSession = false;
      setUser(authData.user);
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
      hasWarnedNoTokenThisSession = false;
      setUser(authData.user);

      if (authData.user.role === USER_ROLE.PARENT) {
        try {
          const childrenData = await childrenRepository.list();
          setChildrenList(childrenData);
        } catch (err: unknown) {
          console.error('Failed to load children:', err);
        }
      }

      router.refresh();
      const targetRedirect = getPostAuthRedirect(authData.user, redirectUrl);
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

    clearAuthToken();
    setUser(null);
    setChildrenList([]);
    setError(null);
    if (userId != null) {
      dashboardSyncStore.clearUser(userId);
    }

    try {
      await authRepository.logout();
    } catch (err: unknown) {
      const status = typeof err === 'object' && err !== null && 'response' in err ? (err as { response?: { status?: number } }).response?.status : undefined;
      if (status !== 401 && status !== 403) {
        console.error('[useAuth] Logout API error (ignored):', err);
      }
    } finally {
      setLoading(false);
      window.location.href = ROUTES.LOGIN;
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const approvedChildren = useMemo(
    () =>
      childrenList.filter((c) => {
        const { approvalStatus, hasChecklist, checklistCompleted } = getChildChecklistFlags(c);
        return approvalStatus === 'approved' && hasChecklist && checklistCompleted === true;
      }),
    [childrenList]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      children: childrenList,
      approvedChildren,
      loading,
      error,
      loadError,
      unauthenticatedReason,
      isAuthenticated: !!user,
      isApproved: user?.approvalStatus?.toLowerCase() === APPROVAL_STATUS.APPROVED,
      hasApprovedChildren: approvedChildren.length > 0,
      canBook: (user?.approvalStatus?.toLowerCase() === APPROVAL_STATUS.APPROVED) && approvedChildren.length > 0,
      register,
      login,
      logout,
      refresh,
    }),
    [
      user,
      childrenList,
      approvedChildren,
      loading,
      error,
      loadError,
      unauthenticatedReason,
      register,
      login,
      logout,
      refresh,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (ctx == null) {
    throw new Error('useAuth must be used within an AuthProvider. Wrap your app (e.g. in layout.tsx) with <AuthProvider>.');
  }
  return ctx;
}
