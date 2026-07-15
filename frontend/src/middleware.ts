import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIndexNowKey, isIndexNowKeyRequest } from "@/marketing/lib/indexnow";

/**
 * Legacy marketing URLs and old CTAs pointed at /sign-in and /sign-up.
 * Real routes are /login and /register. Clone URL so query params are preserved.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Legacy bad links like /https://www.example.com/areas/foo (double-prefixed origin).
  if (pathname.startsWith('/http://') || pathname.startsWith('/https://')) {
    try {
      const embedded = pathname.slice(1);
      const embeddedUrl = new URL(embedded);
      const url = request.nextUrl.clone();
      url.pathname = embeddedUrl.pathname || '/';
      url.search = embeddedUrl.search;
      url.hash = '';
      return NextResponse.redirect(url, 301);
    } catch {
      // fall through
    }
  }

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
  matcher: ["/sign-in", "/sign-up", "/:filename.txt", "/https://:path*", "/http://:path*"],
};
