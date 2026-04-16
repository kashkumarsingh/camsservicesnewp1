/**
 * Legacy naming retained for compatibility with existing imports.
 * Resolves to local SEO-friendly images in /public/images.
 */
import { camsPublicImageJpgPath } from "@/marketing/mock/cams-public-images";

export const CAMS_UNSPLASH_PHOTO = {
  boxingFitness: "fitness-and-wellbeing",
  mentoring: "mentoring-and-coaching",
  community: "community-access-and-transport-services",
  sen: "sen-and-education-support",
  routine: "family-support-service",
  goals: "behavioural-management-and-conflict-resolution",
  inclusiveLearning: "sen-and-education-support",
  collaboration: "sports-support-programme",
  integrityPartnership: "mentoring-and-coaching",
  outdoorEngagement: "sports-support-programme"
} as const;

export function camsUnsplashPhotoUrl(photoId: string, w: number, h: number): string {
  void w;
  void h;
  return camsPublicImageJpgPath(photoId);
}
