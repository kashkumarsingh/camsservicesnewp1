import type { MetadataRoute } from "next";
import { getPublicSiteUrl } from "@/marketing/lib/public-site-url";
import { shouldIndexSite } from "@/marketing/lib/site-indexing";

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteUrl().replace(/\/$/, "");

  if (!shouldIndexSite()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
