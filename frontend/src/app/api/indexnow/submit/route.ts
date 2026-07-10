import { NextResponse } from "next/server";
import sitemap from "@/app/sitemap";
import { getCanonicalUrlForSiteSlug } from "@/marketing/lib/public-site-url";
import { getIndexNowKey, submitIndexNowUrls } from "@/marketing/lib/indexnow";

function isAuthorized(request: Request, body: { secret?: unknown }): boolean {
  const secret = process.env.INDEXNOW_SUBMIT_SECRET?.trim() || process.env.NEXT_REVALIDATE_SECRET?.trim();
  if (!secret) return false;

  const headerSecret = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  return body.secret === secret || headerSecret === secret;
}

/**
 * Submit URLs to IndexNow (Bing, Yandex, etc.).
 * Protected by INDEXNOW_SUBMIT_SECRET or NEXT_REVALIDATE_SECRET.
 */
export async function POST(request: Request) {
  if (!getIndexNowKey()) {
    return NextResponse.json({ message: "IndexNow is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));

  if (!isAuthorized(request, body)) {
    return NextResponse.json({ message: "Invalid secret." }, { status: 401 });
  }

  const rawUrls = Array.isArray(body?.urls) ? body.urls : [];
  const slugs = Array.isArray(body?.slugs) ? body.slugs : [];
  const useSitemap = body?.sitemap === true;

  const urls = [
    ...rawUrls.filter((url: unknown): url is string => typeof url === "string"),
    ...slugs
      .filter((slug: unknown): slug is string => typeof slug === "string")
      .map((slug: string) => getCanonicalUrlForSiteSlug(slug)),
  ];

  if (useSitemap) {
    const entries = await sitemap();
    urls.push(...entries.map((entry) => entry.url));
  }

  if (urls.length === 0) {
    return NextResponse.json({ message: "Provide urls, slugs, or sitemap: true." }, { status: 400 });
  }

  const result = await submitIndexNowUrls(urls);

  if (!result.ok) {
    return NextResponse.json(
      { message: "IndexNow submission failed.", status: result.status },
      { status: 502 }
    );
  }

  return NextResponse.json({
    submitted: result.submitted,
    status: result.status,
  });
}
