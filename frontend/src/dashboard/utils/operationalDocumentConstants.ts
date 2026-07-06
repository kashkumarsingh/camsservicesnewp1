/**
 * Operational document library constants (admin and trainer dashboards).
 */

export const OPERATIONAL_DOCUMENT_CATEGORIES = [
  'safeguarding',
  'transport',
  'hr',
  'operations',
  'legal',
] as const;

export type OperationalDocumentCategory = (typeof OPERATIONAL_DOCUMENT_CATEGORIES)[number];

export const OPERATIONAL_DOCUMENT_AUDIENCES = ['trainer', 'admin', 'all'] as const;

export type OperationalDocumentAudience = (typeof OPERATIONAL_DOCUMENT_AUDIENCES)[number];

export const OPERATIONAL_DOCUMENT_CATEGORY_LABELS: Record<OperationalDocumentCategory, string> = {
  safeguarding: 'Safeguarding',
  transport: 'Transport',
  hr: 'HR and compliance',
  operations: 'Operations',
  legal: 'Legal',
};

export const OPERATIONAL_DOCUMENT_AUDIENCE_LABELS: Record<OperationalDocumentAudience, string> = {
  trainer: 'Trainers only',
  admin: 'Admin only',
  all: 'All staff and trainers',
};
