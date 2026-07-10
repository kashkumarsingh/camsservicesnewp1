import type { LocationArea, LocationAreaFaq } from '@/marketing/content/locations/types';
import {
  areaHeroSubtitle,
  areaHeroTitle,
  areaJsonLdServiceTypes,
  areaMetaDescription,
  areaMetaTitle,
  areaSeoIntroParagraphs,
  buildAreaServicesFaq,
  serviceKeywordsForArea,
} from '@/marketing/content/locations/service-location-keywords';

export {
  areaHeroSubtitle,
  areaHeroTitle,
  areaJsonLdServiceTypes,
  areaMetaDescription,
  areaMetaTitle,
  areaSeoIntroParagraphs,
  buildAreaServicesFaq,
  serviceKeywordsForArea,
  SERVICE_LOCATION_KEYWORDS,
} from '@/marketing/content/locations/service-location-keywords';

export function areaHeroDescription(area: Pick<LocationArea, 'name' | 'keyAreas' | 'heroDescription'>): string {
  return areaHeroSubtitle(area);
}

export function areaFocusKeywords(area: Pick<LocationArea, 'name'>): readonly string[] {
  return serviceKeywordsForArea(area.name);
}

export function mergeAreaFaq(
  area: LocationArea,
  keyAreaSample: string
): readonly LocationAreaFaq[] {
  const servicesFaq = buildAreaServicesFaq(area, keyAreaSample);
  const existing = area.faq.filter((item) => !servicesFaq.some((loc) => loc.q === item.q));
  return [...servicesFaq, ...existing];
}
