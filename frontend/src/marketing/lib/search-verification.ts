import type { Metadata } from "next";

/**
 * Search engine ownership verification tags (root layout only).
 * Set env vars after claiming the site in each webmaster console.
 */
export function getSearchVerificationMetadata(): Pick<Metadata, "verification" | "other"> {
  const google = process.env.NEXT_PUBLIC_GSC_VERIFICATION?.trim();
  const bing = process.env.NEXT_PUBLIC_BING_VERIFICATION?.trim();

  const verification: NonNullable<Metadata["verification"]> = {};
  const other: Record<string, string> = {};

  if (google) {
    verification.google = google;
  }

  if (bing) {
    // Bing Webmaster Tools HTML meta tag: <meta name="msvalidate.01" content="..." />
    other["msvalidate.01"] = bing;
  }

  if (Object.keys(verification).length === 0 && Object.keys(other).length === 0) {
    return {};
  }

  return {
    ...(Object.keys(verification).length > 0 ? { verification } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}
