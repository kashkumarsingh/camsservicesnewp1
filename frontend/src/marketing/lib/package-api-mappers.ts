import type {
  InterventionPackage,
  InterventionPackageId
} from "@/marketing/mock/intervention-packages";

export type PackageApiItem = {
  slug?: string;
  name?: string;
  description?: string;
  price?: number;
  hours?: number;
  duration?: string;
  features?: unknown[];
  perks?: unknown[];
  popular?: boolean;
};

function formatGbpPrice(value: number): string {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0
  }).format(value);
}

export function mergePackageWithApi(
  fallback: InterventionPackage,
  apiPackage: PackageApiItem | undefined
): InterventionPackage {
  if (!apiPackage) {
    return fallback;
  }

  const hours = Number(apiPackage.hours ?? 0);
  const firstPerk = Array.isArray(apiPackage.perks) ? apiPackage.perks[0] : null;
  const badgeLabel = typeof firstPerk === "string" && firstPerk.trim().length > 0 ? firstPerk : null;

  return {
    ...fallback,
    name: typeof apiPackage.name === "string" && apiPackage.name.length > 0 ? apiPackage.name : fallback.name,
    programmeSubtitle:
      typeof apiPackage.description === "string" && apiPackage.description.length > 0
        ? apiPackage.description
        : fallback.programmeSubtitle,
    featured: typeof apiPackage.popular === "boolean" ? apiPackage.popular : fallback.featured,
    packagesPageBadge: badgeLabel ?? fallback.packagesPageBadge,
    homeBadge: badgeLabel ?? fallback.homeBadge,
    price: typeof apiPackage.price === "number" ? formatGbpPrice(apiPackage.price) : fallback.price,
    frequencyLine: hours > 0 ? `${hours} Hours` : fallback.frequencyLine,
    homeDurationLine:
      typeof apiPackage.duration === "string" && apiPackage.duration.length > 0
        ? apiPackage.duration
        : hours > 0
          ? `${hours} Hours`
          : fallback.homeDurationLine,
    features:
      Array.isArray(apiPackage.features) && apiPackage.features.every((item) => typeof item === "string")
        ? (apiPackage.features as string[])
        : fallback.features,
    bestFor:
      typeof apiPackage.description === "string" && apiPackage.description.length > 0
        ? apiPackage.description
        : fallback.bestFor
  };
}

export function mapPackageListWithFallbacks(
  apiPackages: readonly PackageApiItem[],
  fallbackPackages: readonly InterventionPackage[]
): readonly InterventionPackage[] {
  const fallbackById = new Map<InterventionPackageId, InterventionPackage>(
    fallbackPackages.map((pkg) => [pkg.id, pkg])
  );

  const mapped = apiPackages
    .map((apiPackage) => {
      const fallbackId = String(apiPackage.slug ?? "").toLowerCase() as InterventionPackageId;
      const fallback = fallbackById.get(fallbackId);
      if (!fallback) {
        return null;
      }

      return mergePackageWithApi(fallback, apiPackage);
    })
    .filter((pkg): pkg is InterventionPackage => pkg !== null);

  return mapped.length > 0 ? mapped : fallbackPackages;
}
