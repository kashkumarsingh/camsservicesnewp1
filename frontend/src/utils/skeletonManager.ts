/**
 * Skeleton Manager – Centralised dashboard skeleton registry
 *
 * Maps dashboard route/variant to the correct skeleton component so loading
 * states match the actual page layout (no left sidebar on parent overview,
 * correct columns and header for each role/page).
 *
 * Usage:
 * - getDashboardSkeleton(variant) → component to render
 * - <DashboardSkeleton variant="parent" /> in page clients
 */

import type { ComponentType } from 'react';

/**
 * Dashboard skeleton variants.
 * Each variant corresponds to a specific page layout so the skeleton matches the real UI.
 */
export type DashboardSkeletonVariant =
  | 'parent'           // Parent overview: header + calendar + right sidebar (no left sidebar)
  | 'trainer'         // Trainer overview: header + tab area + main content
  | 'parent-children' // Parent My Children: header + grid of child cards
  | 'admin';          // Admin overview: stats + content (future)

export type SkeletonRegistry = Record<
  DashboardSkeletonVariant,
  ComponentType<Record<string, never>>
>;

/**
 * Resolve variant from pathname for route-based skeleton selection.
 * Use when you want the skeleton to be chosen by URL (e.g. in a shared layout).
 */
export function getDashboardSkeletonVariantFromPath(pathname: string): DashboardSkeletonVariant {
  if (pathname.startsWith('/dashboard/parent/children')) return 'parent-children';
  if (pathname.startsWith('/dashboard/parent')) return 'parent';
  if (pathname.startsWith('/dashboard/trainer')) return 'trainer';
  if (pathname.startsWith('/dashboard/admin')) return 'admin';
  return 'parent';
}
