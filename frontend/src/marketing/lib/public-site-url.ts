/**
 * Canonical public origin for metadata, sitemap, and robots.
 */

const DEFAULT_PRODUCTION_ORIGIN = 'https://www.camsservices.co.uk';
const DEFAULT_DEV_ORIGIN = 'http://localhost:4300';

function readSiteUrlEnv(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  return raw && raw.length > 0 ? raw : null;
}

/**
 * Origin only (protocol + host). Strips accidental paths from NEXT_PUBLIC_SITE_URL.
 */
export function resolvePublicSiteOrigin(raw?: string | null): string {
  const value = raw ?? readSiteUrlEnv();

  if (value) {
    try {
      const candidate = value.includes('://') ? value : `https://${value}`;
      return new URL(candidate).origin;
    } catch {
      const match = value.match(/^https?:\/\/[^/]+/i);
      if (match) {
        return match[0].replace(/\/$/, '');
      }
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PRODUCTION_ORIGIN;
  }

  return DEFAULT_DEV_ORIGIN;
}

/** Origin for metadata/canonical tags; safe fallback when env is unset at build time. */
export function getMetadataBaseUrl(): string {
  return resolvePublicSiteOrigin();
}

export function getPublicSiteUrl(): string {
  if (!readSiteUrlEnv() && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_SITE_URL is required in production.');
  }

  return resolvePublicSiteOrigin();
}

/** Relative site path with leading slash, or "/" for home. */
export function normalizePublicPath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return '/';

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      const pathname = url.pathname || '/';
      const suffix = `${url.search}${url.hash}`;
      return suffix ? `${pathname}${suffix}` : pathname;
    } catch {
      return `/${trimmed.replace(/^\/+/, '')}`;
    }
  }

  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
}

export function joinPublicUrl(origin: string, path: string): string {
  const base = origin.replace(/\/$/, '');
  const normalizedPath = normalizePublicPath(path);

  if (normalizedPath === '/') {
    return `${base}/`;
  }

  return `${base}${normalizedPath}`;
}

/**
 * Repair URLs where the origin was accidentally prefixed twice, e.g.
 * https://www.example.com/https://www.example.com/areas/foo
 */
export function sanitizePublicUrl(url: string, origin = resolvePublicSiteOrigin()): string {
  const base = origin.replace(/\/$/, '');
  const trimmed = url.trim();

  if (!trimmed) {
    return `${base}/`;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return joinPublicUrl(base, trimmed);
  }

  let candidate = trimmed;
  const repeatedPrefix = `${base}/${base}`;

  while (candidate.startsWith(repeatedPrefix)) {
    candidate = `${base}${candidate.slice(repeatedPrefix.length)}`;
  }

  if (candidate.startsWith(`${base}/http`)) {
    return joinPublicUrl(base, candidate);
  }

  try {
    return new URL(candidate).toString();
  } catch {
    return joinPublicUrl(base, candidate);
  }
}

export function getCanonicalUrlForSiteSlug(slug: string): string {
  const base = getPublicSiteUrl();
  const trimmed = slug.trim();

  if (!trimmed) {
    return `${base}/`;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return sanitizePublicUrl(trimmed, base);
  }

  const normalized = trimmed.replace(/^\/+|\/+$/g, '');
  if (!normalized) {
    return `${base}/`;
  }

  const encodedPath = normalized
    .split('/')
    .filter((segment) => segment.length > 0)
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${base}/${encodedPath}`;
}
