import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

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

  return NextResponse.json({ revalidated: true, tag });
}


