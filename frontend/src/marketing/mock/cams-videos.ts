/** Public video assets under `frontend/public/videos`; single source (mirrors `cams-unsplash.ts` for images). */
export const CAMS_VIDEO = {
  heroBackground: "/videos/space-bg-2.mp4"
} as const;

export type CamsVideoKey = keyof typeof CAMS_VIDEO;

export function camsVideoSrc(key: CamsVideoKey): string {
  return CAMS_VIDEO[key];
}
