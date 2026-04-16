import type { CamsIconName } from "@/marketing/components/shared/CamsIcon";
import { CAMS_HERO_CARD_IMAGES, camsProgrammeImagePath } from "@/marketing/mock/cams-public-images";
import { ROUTES } from "@/shared/utils/routes";

export type HomeServiceProgramme = {
  readonly icon: CamsIconName;
  readonly title: string;
  readonly description: string;
  readonly href: string;
  readonly image: string;
};

/** Same order as services page jump nav. */
export const HOME_SERVICE_PROGRAMMES: readonly HomeServiceProgramme[] = [
  {
    icon: "trophy",
    title: "Sports Support Programme",
    description: "One-to-one support across training, development and participation in sport",
    href: ROUTES.SERVICE_BY_SLUG("sports-support-programme"),
    image: camsProgrammeImagePath("outdoorEngagement")
  },
  {
    icon: "dumbbell",
    title: "Fitness and Wellbeing",
    description: "One-to-one support to improve physical health, routine and overall wellbeing",
    href: ROUTES.SERVICE_BY_SLUG("boxing-fitness"),
    image: camsProgrammeImagePath("boxingFitness")
  },
  {
    icon: "trees",
    title: "Community Access and Transport Services",
    description: "One-to-one support to safely access the community, activities and appointments",
    href: ROUTES.SERVICE_BY_SLUG("community"),
    image: camsProgrammeImagePath("community")
  },
  {
    icon: "target",
    title: "Behavioural Management and Conflict Resolution",
    description: "One-to-one strategies to manage behaviour, reduce conflict and improve responses",
    href: ROUTES.SERVICE_BY_SLUG("goals"),
    image: camsProgrammeImagePath("goals")
  },
  {
    icon: "messageCircle",
    title: "Mentoring and Coaching",
    description: "One-to-one guidance to build confidence, decision making and personal growth",
    href: ROUTES.SERVICE_BY_SLUG("mentoring"),
    image: camsProgrammeImagePath("mentoring")
  },
  {
    icon: "heartHandshake",
    title: "Family Support Service",
    description: "One-to-one support to strengthen communication and build healthier relationships",
    href: ROUTES.SERVICE_BY_SLUG("routine"),
    image: camsProgrammeImagePath("routine")
  },
  {
    icon: "puzzle",
    title: "SEN and Education Support",
    description: "One-to-one tailored support for additional needs, learning and school engagement",
    href: ROUTES.SERVICE_BY_SLUG("sen"),
    image: camsProgrammeImagePath("sen")
  }
] as const;

/** Three overlapping hero frames: sports, fitness, community (replace with consent-led photography in production). */
export const HOME_HERO_CARD_IMAGES: readonly string[] = [
  ...CAMS_HERO_CARD_IMAGES
].filter((src) => src.length > 0);
