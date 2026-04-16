import type { ServiceProgrammeListItem } from "@/marketing/mock/services-programmes";
import { ROUTES } from "@/shared/utils/routes";

export type ServiceApiItem = {
  slug?: string;
  title?: string;
  description?: string;
  summary?: string;
};

export function mapServiceListWithFallbacks(
  apiServices: readonly ServiceApiItem[],
  fallbackProgrammes: ReadonlyArray<ServiceProgrammeListItem>
): ReadonlyArray<ServiceProgrammeListItem> {
  const fallbackByHref = new Map(fallbackProgrammes.map((item) => [item.href, item]));

  const mapped = apiServices
    .map((row) => {
      const raw = String(row.slug ?? "")
        .replace(/^\/+/, "")
        .replace(/^services\//, "");
      if (!raw) {
        return null;
      }
      const href = ROUTES.SERVICE_BY_SLUG(raw);
      const fallback = fallbackByHref.get(href);
      if (!fallback) {
        return null;
      }

      // Keep canonical frontend copy; API row order/slugs only decide which programmes appear.
      return fallback;
    })
    .filter((item): item is ServiceProgrammeListItem => item !== null);

  const uniqueByHref = new Map<string, ServiceProgrammeListItem>();
  for (const item of mapped) {
    if (!uniqueByHref.has(item.href)) {
      uniqueByHref.set(item.href, item);
    }
  }
  const deduped = [...uniqueByHref.values()];

  if (deduped.length === 0) {
    return fallbackProgrammes;
  }

  const orderIndex = new Map(fallbackProgrammes.map((p, i) => [p.href, i]));
  deduped.sort((a, b) => (orderIndex.get(a.href) ?? 999) - (orderIndex.get(b.href) ?? 999));

  return deduped;
}
