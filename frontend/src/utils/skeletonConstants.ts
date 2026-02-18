/**
 * Skeleton Loading Constants
 * 
 * Centralized definition of skeleton loading counts for all components.
 * This provides a single source of truth for skeleton loading states,
 * making it easier to maintain and update skeleton counts across the application.
 * 
 * Plain English: This file contains all the skeleton loading counts in one place.
 * Instead of hardcoding skeleton counts in each component, we define them here
 * and import them. This makes it easier to:
 * - Change skeleton counts in one place
 * - See all available skeleton counts at a glance
 * - Avoid inconsistencies
 * - Update counts when needed
 */

/**
 * Skeleton Loading Counts
 * These define how many placeholder items to show in each section during loading
 */
export const SKELETON_COUNTS = {
  // Footer
  TRUST_INDICATORS: 3,
  SOCIAL_LINKS: 4,
  QUICK_LINKS: 4,
  CONTACT_ITEMS: 3,
  LEGAL_LINKS: 4,
  
  // List Components
  TRAINERS: 6,
  PACKAGES: 6,
  SERVICES: 8,
  BLOG_POSTS: 6,
  FAQS: 8,
  TESTIMONIALS: 6,
  
  // Dashboard
  DASHBOARD_CHILDREN: 3,
  DASHBOARD_PENDING_ACTIONS: 2,
  DASHBOARD_CALENDAR_WEEKS: 5, // 5 weeks displayed (35 days)
  LIST_ROWS: 4,
  TABLE_ROWS: 6,
} as const;

/**
 * Type-safe skeleton count getter
 * Ensures skeleton counts are accessed correctly
 */
export type SkeletonCountKey = keyof typeof SKELETON_COUNTS;

