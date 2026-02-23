/**
 * Auth Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for authentication API calls
 * Location: frontend/src/infrastructure/http/auth/AuthRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  hasAuthToken,
} from './authTokenProvider';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '@/core/application/auth/types';

export class AuthRepository {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // ApiClient unwraps the response; backend keysToCamelCase so data has accessToken, tokenType
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH_REGISTER,
      data
    );

    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
    }

    return response.data;
  }

  /**
   * Ensure Sanctum CSRF cookie is set (required for cross-origin login e.g. Vercel → Railway).
   * Safe to call every time; no-op if already has cookie or non-browser.
   */
  private async ensureSanctumCsrfCookie(): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      const origin = apiClient.getBaseOrigin();
      await fetch(`${origin}/sanctum/csrf-cookie`, { method: 'GET', credentials: 'include' });
    } catch {
      // Non-fatal; login may still work with token-only auth
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    await this.ensureSanctumCsrfCookie();
    // ApiClient unwraps the response; backend keysToCamelCase so data has accessToken, tokenType
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH_LOGIN,
      data
    );

    if (response.data.accessToken) {
      setAuthToken(response.data.accessToken);
    }

    return response.data;
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { user: {...} } }
    // ApiClient returns: { data: { user: {...} } }
    const response = await apiClient.get<{ user: User }>(
      API_ENDPOINTS.AUTH_USER
    );
    
    if (!response.data?.user) {
      throw new Error('Invalid response: missing user');
    }
    return response.data.user;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH_LOGOUT);
    } finally {
      clearAuthToken();
    }
  }

  /**
   * Get auth token (delegates to authTokenProvider).
   */
  getToken(): string | null {
    return getAuthToken();
  }

  /**
   * Check if user is authenticated (token present).
   */
  isAuthenticated(): boolean {
    return hasAuthToken();
  }
}

export const authRepository = new AuthRepository();

