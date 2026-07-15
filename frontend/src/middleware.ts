import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIndexNowKey, isIndexNowKeyRequest } from "@/marketing/lib/indexnow";

/**
 * Legacy marketing URLs and old CTAs pointed at /sign-in and /sign-up.
 * Real routes are /login and /register. Clone URL so query params are preserved.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isIndexNowKeyRequest(pathname)) {
    const key = getIndexNowKey();
    if (key) {
      return new NextResponse(key, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }
  }

  const url = request.nextUrl.clone();
  if (url.pathname === "/sign-in") {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (url.pathname === "/sign-up") {
    url.pathname = "/register";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sign-in", "/sign-up", "/:filename.txt"],
};
