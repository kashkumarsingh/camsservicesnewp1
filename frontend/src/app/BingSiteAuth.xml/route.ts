import { NextResponse } from "next/server";

/**
 * Bing Webmaster Tools XML file verification.
 * Set NEXT_PUBLIC_BING_SITE_AUTH_USER to the <user> value from BingSiteAuth.xml.
 */
export function GET(): NextResponse {
  const user = process.env.NEXT_PUBLIC_BING_SITE_AUTH_USER?.trim();

  if (!user) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const xml = `<?xml version="1.0"?>
<users>
\t<user>${user}</user>
</users>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
