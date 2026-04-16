import type { PackageDTO } from "@/core/application/packages/dto/PackageDTO";
import {
  INTERVENTION_PACKAGES,
  type InterventionPackage
} from "@/marketing/mock/intervention-packages";

function parseGbpPrice(price: string): number {
  const n = Number(String(price).replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function parseHoursFromFrequencyLine(line: string): number {
  const m = /^(\d+)/.exec(line.trim());
  return m ? parseInt(m[1], 10) : 0;
}

export function getInterventionPackageBySlug(slug: string): InterventionPackage | undefined {
  const s = slug.replace(/\/+$/, "").toLowerCase();
  return INTERVENTION_PACKAGES.find((p) => p.id === s);
}

/**
 * When the API has no package for a tier slug (mercury…neptune), still render
 * /packages/[slug] and /book/[slug] using marketing copy so users never hit404.
 */
export function interventionPackageToFallbackDTO(intervention: InterventionPackage): PackageDTO {
  const hours = parseHoursFromFrequencyLine(intervention.frequencyLine);
  const price = parseGbpPrice(intervention.price);
  const description =
    intervention.bestFor?.trim() ||
    intervention.programmeSubtitle?.trim() ||
    `${intervention.name} intervention package.`;
  const totalWeeks = 6;
  const hoursPerWeek = hours > 0 ? Math.max(1, Math.ceil(hours / totalWeeks)) : 1;
  const now = new Date().toISOString();

  return {
    id: intervention.id,
    name: intervention.name,
    slug: intervention.id,
    description,
    hours,
    price,
    duration: `${hoursPerWeek} hours per week for ${totalWeeks} weeks`,
    color: "#2563eb",
    features: [...intervention.features],
    activities: [],
    trainers: [],
    testimonials: undefined,
    trustIndicators: undefined,
    perks: [],
    popular: intervention.featured,
    hoursPerWeek,
    totalWeeks,
    spotsRemaining: 10,
    views: 0,
    metrics: undefined,
    canBeBooked: true,
    createdAt: now,
    updatedAt: now
  };
}
