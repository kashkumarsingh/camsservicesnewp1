export interface PageSectionDTO {
  type: string;
  data: Record<string, unknown>;
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
  /** Only present when type === 'about' */
  mission?: AboutMissionDTO | null;
  coreValues?: AboutCoreValueDTO[] | null;
  coreValuesSectionTitle?: string | null;
  coreValuesSectionSubtitle?: string | null;
  safeguarding?: AboutSafeguardingDTO | null;
}


