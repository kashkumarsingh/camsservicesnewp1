/**
 * Canonical public origin for metadata, sitemap, and robots.
 */
export function getPublicSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (raw) {
    const url = new URL(raw);
    url.pathname = "/";
    return url.toString().replace(/\/$/, "");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("NEXT_PUBLIC_SITE_URL is required in production.");
  }

  return "http://localhost:4300";
}

export function getCanonicalUrlForSiteSlug(slug: string): string {
  const base = getPublicSiteUrl();
  const normalized = slug.trim().replace(/^\/+|\/+$/g, "");
  if (!normalized) return `${base}/`;
  const encodedPath = normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/${encodedPath}`;
}