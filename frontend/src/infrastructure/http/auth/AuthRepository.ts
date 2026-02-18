/**
 * Auth Repository (Infrastructure Layer)
 * 
 * Clean Architecture: Infrastructure Layer
 * Purpose: HTTP client for authentication API calls
 * Location: frontend/src/infrastructure/http/auth/AuthRepository.ts
 */

import { apiClient } from '../ApiClient';
import { API_ENDPOINTS } from '../apiEndpoints';
import type { RegisterRequest, LoginRequest, AuthResponse, User } from '@/core/application/auth/types';

export class AuthRepository {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { user: {...}, access_token: "...", token_type: "Bearer" } }
    // ApiClient returns: { data: { user: {...}, access_token: "...", token_type: "Bearer" } }
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH_REGISTER,
      data
    );
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
    }
    
    return response.data;
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    // ApiClient unwraps the response, so response.data is the actual data object
    // Backend returns: { success: true, data: { user: {...}, access_token: "...", token_type: "Bearer" } }
    // ApiClient returns: { data: { user: {...}, access_token: "...", token_type: "Bearer" } }
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH_LOGIN,
      data
    );
    
    // Store token
    if (response.data.access_token) {
      localStorage.setItem('auth_token', response.data.access_token);
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
      // Always clear tokens, even if API call fails
      localStorage.removeItem('auth_token');
    }
  }

  /**
   * Get auth token from storage
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem('auth_token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authRepository = new AuthRepository();

