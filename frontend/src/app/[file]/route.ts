import { NextResponse } from 'next/server';
import { getIndexNowKey } from '@/marketing/lib/indexnow';

type RouteContext = {
  params: Promise<{ file: string }>;
};

/**
 * Serves IndexNow verification at /{INDEXNOW_KEY}.txt (root of the site).
 * More reliable than middleware alone on Vercel edge.
 */
export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const { file } = await context.params;
  const key = getIndexNowKey();

  if (!key || file !== `${key}.txt`) {
    return new NextResponse('Not found', { status: 404 });
  }

  return new NextResponse(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
