import type { LocationArea } from '@/marketing/content/locations/types';
import { LOCATION_AREAS } from '@/marketing/content/locations/areas';

const bySlug = new Map(LOCATION_AREAS.map((area) => [area.slug, area]));

export type { LocationArea, LocationAreaFaq, LocationCouncilType } from '@/marketing/content/locations/types';
export { LOCATION_AREAS };
export {
  PHASE6_EXPANSION_ORDER,
  PHASE6_LOCATION_AREAS,
} from '@/marketing/content/locations/areas-phase6';

export function getLocationAreaBySlug(slug: string): LocationArea | null {
  return bySlug.get(slug) ?? null;
}

export function getLocationAreasByRegion(regionSlug: string): readonly LocationArea[] {
  return LOCATION_AREAS.filter((area) => area.regionSlug === regionSlug);
}

export function getLocationAreaSitemapEntries(): ReadonlyArray<{
  path: string;
  lastModified: Date;
}> {
  return LOCATION_AREAS.map((area) => ({
    path: `areas/${area.slug}`,
    lastModified: new Date(),
  }));
}

export function getBorderingAreas(area: LocationArea): readonly LocationArea[] {
  return area.borderingSlugs
    .map((slug) => bySlug.get(slug))
    .filter((item): item is LocationArea => item != null);
}

export { getServiceLocationPairs, getServiceLocationSitemapEntries } from '@/marketing/content/locations/service-location-page-content';
