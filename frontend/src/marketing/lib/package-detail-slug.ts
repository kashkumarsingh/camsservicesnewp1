import {
  INTERVENTION_PACKAGE_IDS,
  type InterventionPackageId
} from "@/marketing/mock/intervention-packages";

export function parsePackageDetailSlug(slug: string): InterventionPackageId | null {
  const normalizedSlug = slug.replace(/\/+$/, "").toLowerCase();
  const match = /^packages\/([^/]+)$/.exec(normalizedSlug);
  if (!match) {
    return null;
  }
  const segment = decodeURIComponent(match[1]);
  return (INTERVENTION_PACKAGE_IDS as readonly string[]).includes(segment)
    ? (segment as InterventionPackageId)
    : null;
}

export function packageDetailHref(packageId: InterventionPackageId): string {
  return `/packages/${packageId}`;
}
