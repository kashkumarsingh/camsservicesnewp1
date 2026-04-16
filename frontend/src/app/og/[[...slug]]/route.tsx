import type { ImageResponse } from "next/og";
import { createOgImageResponse } from "@/marketing/lib/create-og-image-response";
import { getOgContentForSlug } from "@/marketing/lib/og-route-content";

export const runtime = "edge";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug?: string[] }> }
): Promise<ImageResponse> {
  const resolved = await context.params;
  const path = resolved.slug?.join("/") ?? "";
  const { title, summary } = await getOgContentForSlug(path);
  return createOgImageResponse({ title, summary });
}
