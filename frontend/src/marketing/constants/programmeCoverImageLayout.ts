/**
 * `width` / `height` for `next/image` on programme covers (`/public/images/*.jpg`).
 * These match **typical max rendered size** per layout so the optimizer requests a * sensible `w=` — not the pixel dimensions of your source files.
 */
export const PROGRAMME_COVER_IMAGE_LAYOUT = {
  homeThumb: { width: 240, height: 180 },
  heroCollage: { width: 640, height: 427 },
  servicesArticle: { width: 768, height: 512 },
  detailPanel: { width: 896, height: 597 },
  relatedCard: { width: 480, height: 300 }
} as const;
