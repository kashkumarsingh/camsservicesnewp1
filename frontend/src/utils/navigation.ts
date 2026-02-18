/**
 * Navigation Utilities
 * 
 * Clean Architecture: Infrastructure/Utils Layer
 * Purpose: Centralized navigation and redirect utilities
 * Location: frontend/src/utils/navigation.ts
 * 
 * Follows DRY principle and Clean Architecture by centralizing
 * role-based redirect logic in a single, reusable utility.
 */

import type { User } from '@/core/application/auth/types';

/**
 * Get the default dashboard route for a user based on their role
 * 
 * @param user - The authenticated user
 * @returns The dashboard route for the user's role
 */
export function getDashboardRoute(user: User | null): string {
  if (!user) {
    return '/dashboard';
  }

  switch (user.role) {
    case 'trainer':
      return '/dashboard/trainer';
    case 'editor':
      return '/dashboard/editor';
    case 'admin':
    case 'super_admin':
      return '/dashboard/admin';
    case 'parent':
    default:
      return '/dashboard/parent';
  }
}

/**
 * Get the redirect route after login/registration
 * 
 * @param user - The authenticated user
 * @param redirectParam - Optional redirect parameter from query string
 * @returns The route to redirect to
 */
export function getPostAuthRedirect(user: User | null, redirectParam?: string | null): string {
  // If a specific redirect is requested, use it (but validate it's safe)
  if (redirectParam) {
    // Security: Only allow relative paths
    if (redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
      return redirectParam;
    }
  }

  // Otherwise, use role-based default dashboard
  return getDashboardRoute(user);
}

/**
 * Get the canonical parent dashboard route (role-based dashboard, independent of public pages).
 *
 * @returns The canonical parent dashboard route (/dashboard/parent)
 */
export function getParentDashboardRoute(): string {
  return '/dashboard/parent';
}

/**
 * Check if a route requires a specific role
 * 
 * @param route - The route path
 * @returns The required role, or null if no specific role required
 */
export function getRequiredRoleForRoute(route: string): User['role'] | null {
  if (route.startsWith('/dashboard/trainer')) {
    return 'trainer';
  }
  if (route.startsWith('/dashboard/admin/public-pages')) {
    return 'editor';
  }
  if (route.startsWith('/dashboard/editor')) {
    return 'editor';
  }
  if (route.startsWith('/dashboard/admin')) {
    return 'admin';
  }
  return null;
}

/**
 * Check if a user can access a specific route
 * 
 * @param user - The authenticated user
 * @param route - The route path
 * @returns True if user can access the route
 */
export function canAccessRoute(user: User | null, route: string): boolean {
  if (!user) {
    return false;
  }

  const requiredRole = getRequiredRoleForRoute(route);
  if (!requiredRole) {
    return true; // No specific role required
  }

  // Check if user has the required role or higher
  const roleHierarchy: Record<User['role'], number> = {
    'parent': 1,
    'trainer': 2,
    'editor': 3,
    'admin': 4,
    'super_admin': 5,
  };

  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

