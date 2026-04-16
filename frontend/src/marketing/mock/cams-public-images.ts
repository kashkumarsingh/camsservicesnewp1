export const CAMS_PUBLIC_IMAGE_ID = {
  heroSports: "sports-support-programme",
  heroGym: "fitness-and-wellbeing",
  heroChauffeur: "community-access-and-transport-services"
} as const;

export function camsPublicImageJpgPath(id: string): string {
  return `/images/${id}.jpg`;
}

export const CAMS_HERO_CARD_IMAGES: readonly string[] = [
  camsPublicImageJpgPath(CAMS_PUBLIC_IMAGE_ID.heroSports),
  camsPublicImageJpgPath(CAMS_PUBLIC_IMAGE_ID.heroGym),
  camsPublicImageJpgPath(CAMS_PUBLIC_IMAGE_ID.heroChauffeur)
];

export const CAMS_PROGRAMME_IMAGE_ID = {
  outdoorEngagement: "sports-support-programme",
  boxingFitness: "fitness-and-wellbeing",
  community: "community-access-and-transport-services",
  goals: "behavioural-management-and-conflict-resolution",
  mentoring: "mentoring-and-coaching",
  routine: "family-support-service",
  sen: "sen-and-education-support"
} as const;

export type CamsProgrammeImageKey = keyof typeof CAMS_PROGRAMME_IMAGE_ID;

export function camsProgrammeImagePath(key: CamsProgrammeImageKey): string {
  return camsPublicImageJpgPath(CAMS_PROGRAMME_IMAGE_ID[key]);
}
