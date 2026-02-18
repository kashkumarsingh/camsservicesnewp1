/**
 * Dashboard Skeleton Component
 *
 * Centralised entry: renders the skeleton that matches the given dashboard variant.
 * Content is rendered inside DashboardShell, so variants only define the inner layout.
 *
 * - parent: header + calendar + right sidebar (no left sidebar)
 * - trainer: header + main content block
 * - parent-children: breadcrumbs + header + grid of child cards
 * - admin: fallback to a generic content skeleton
 */

import React from 'react';
import type { DashboardSkeletonVariant } from '@/utils/skeletonManager';
import ParentDashboardSkeleton from './ParentDashboardSkeleton';
import TrainerDashboardSkeleton from './TrainerDashboardSkeleton';
import ParentChildrenPageSkeleton from './ParentChildrenPageSkeleton';

const SKELETON_MAP: Record<DashboardSkeletonVariant, React.ComponentType<Record<string, never>>> = {
  parent: ParentDashboardSkeleton,
  trainer: TrainerDashboardSkeleton,
  'parent-children': ParentChildrenPageSkeleton,
  admin: ParentDashboardSkeleton, // reuse parent layout until admin-specific skeleton exists
};

export interface DashboardSkeletonProps {
  /** Which dashboard layout to mimic. Default 'parent'. */
  variant?: DashboardSkeletonVariant;
}

export default function DashboardSkeleton({ variant = 'parent' }: DashboardSkeletonProps) {
  const SkeletonComponent = SKELETON_MAP[variant] ?? SKELETON_MAP.parent;
  return <SkeletonComponent />;
}
