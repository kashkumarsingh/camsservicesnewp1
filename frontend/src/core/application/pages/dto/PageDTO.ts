export interface PageSectionDTO {
  type: string;
  data: Record<string, unknown>;
}

/** Phase 5: Visibility/scheduling — optional per-block meta. */
export interface PageBlockMetaDTO {
  visibleFrom?: string | null;
  visibleUntil?: string | null;
  hideOnMobile?: boolean | null;
}

/** Page Builder: one block (id, type, payload, meta). Payload shape depends on block type. */
export interface PageBlockDTO {
  id?: string;
  type: string;
  payload: Record<string, unknown>;
  meta?: PageBlockMetaDTO | null;
}

/** Page Builder: admin block with id and sortOrder for CRUD/reorder. */
export interface AdminPageBlockDTO {
  id: string;
  sortOrder: number;
  type: string;
  payload: Record<string, unknown>;
  meta?: PageBlockMetaDTO | null;
}

/** About page: mission block (optional). */
export interface AboutMissionDTO {
  title?: string;
  description?: string;
}

/** About page: one core value card. */
export interface AboutCoreValueDTO {
  icon?: string;
  title: string;
  description: string;
}

/** About page: safeguarding block (optional). */
export interface AboutSafeguardingDTO {
  title?: string;
  subtitle?: string;
  description?: string;
  badges?: string[];
}

export interface PageDTO {
  id: string;
  title: string;
  slug: string;
  type: string;
  summary?: string;
  content: string;
  sections?: PageSectionDTO[];
  lastUpdated?: string;
  effectiveDate?: string;
  version: string;
  views: number;
  published: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Page Builder: ordered blocks (hero, features, faq, etc.). */
  blocks?: PageBlockDTO[];
  /** Only present when type === 'about' */
  mission?: AboutMissionDTO | null;
  coreValues?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}


