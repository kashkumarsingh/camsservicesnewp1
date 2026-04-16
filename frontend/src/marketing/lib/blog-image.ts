import { getPublicApiBaseUrl } from "@/marketing/lib/public-api";

export function normalizeBlogHeroImage(heroImage: unknown): string | null {
  if (typeof heroImage !== "string") {
    return null;
  }

  const trimmed = heroImage.trim();
  if (!trimmed) {
    return null;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith("/")) {
    return `${getPublicApiBaseUrl()}${trimmed}`;
  }

  return null;
}
