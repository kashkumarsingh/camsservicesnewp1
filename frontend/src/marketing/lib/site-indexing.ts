/**
 * Indexing guard:
 * local dev, Vercel preview/dev, *.vercel.app, or NEXT_PUBLIC_SITE_NOINDEX=true => noindex.
 */
export function shouldIndexSite(): boolean {
  if (process.env.NEXT_PUBLIC_SITE_NOINDEX === "true") {
    return false;
  }

  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "preview" || vercelEnv === "development") {
    return false;
  }

  const url = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!url || url.includes("localhost") || url.includes("127.0.0.1")) {
    return false;
  }
  if (url.includes(".vercel.app")) {
    return false;
  }

  return true;
}
