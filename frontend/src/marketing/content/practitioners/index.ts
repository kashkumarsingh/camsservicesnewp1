import type { PractitionerProfile } from '@/marketing/content/practitioners/types';
import { KENNETH_HOLDER_PROFILE } from '@/marketing/content/practitioners/kenneth-holder';

export const PRACTITIONER_PROFILES: readonly PractitionerProfile[] = [KENNETH_HOLDER_PROFILE];

const bySlug = new Map(PRACTITIONER_PROFILES.map((profile) => [profile.slug, profile]));

export type { PractitionerProfile } from '@/marketing/content/practitioners/types';
export { KENNETH_HOLDER_PROFILE };

export function getPractitionerProfileBySlug(slug: string): PractitionerProfile | null {
  return bySlug.get(slug) ?? null;
}

export function getPractitionerProfileSlugs(): readonly string[] {
  return PRACTITIONER_PROFILES.map((profile) => profile.slug);
}

export function getPractitionerSitemapEntries(): ReadonlyArray<{
  path: string;
  lastModified: Date;
}> {
  return PRACTITIONER_PROFILES.map((profile) => ({
    path: `practitioners/${profile.slug}`,
    lastModified: new Date(),
  }));
}
