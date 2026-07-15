import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getCanonicalUrlForSiteSlug, sanitizePublicUrl } from '@/marketing/lib/public-site-url';
import { submitIndexNowUrls } from '@/marketing/lib/indexnow';

export async function POST(request: Request) {
  const secret = process.env.NEXT_REVALIDATE_SECRET;

  if (!secret) {
    return NextResponse.json(
      { message: 'Revalidation secret is not configured.' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => ({}));

  if (body?.secret !== secret) {
    return NextResponse.json({ message: 'Invalid secret.' }, { status: 401 });
  }

  const tag = body?.tag;

  if (typeof tag !== 'string' || tag.length === 0) {
    return NextResponse.json({ message: 'Invalid tag.' }, { status: 400 });
  }

  revalidateTag(tag, 'page');

  let indexNow: { submitted: number; status: number } | null = null;
  const rawUrls = Array.isArray(body?.urls) ? body.urls : [];
  const slugs = Array.isArray(body?.slugs) ? body.slugs : [];
  const urls = [
    ...rawUrls
      .filter((url: unknown): url is string => typeof url === 'string')
      .map((url: string) => sanitizePublicUrl(url)),
    ...slugs
      .filter((slug: unknown): slug is string => typeof slug === 'string')
      .map((slug: string) => getCanonicalUrlForSiteSlug(slug)),
  ];

  if (urls.length > 0) {
    const result = await submitIndexNowUrls(urls);
    indexNow = { submitted: result.submitted, status: result.status };
  }

  return NextResponse.json({ revalidated: true, tag, indexNow });
}


