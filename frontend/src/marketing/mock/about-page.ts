import { CAMS_UNSPLASH_PHOTO, camsUnsplashPhotoUrl } from "@/marketing/mock/cams-unsplash";

export const ABOUT_STORY_MEDIA = camsUnsplashPhotoUrl(
  CAMS_UNSPLASH_PHOTO.mentoring,
  900,
  720
);

export const ABOUT_STORY_FEATURE_IMAGE = camsUnsplashPhotoUrl(
  CAMS_UNSPLASH_PHOTO.inclusiveLearning,
  900,
  1100
);

export const ABOUT_WHY_FEATURE_IMAGE = camsUnsplashPhotoUrl(
  CAMS_UNSPLASH_PHOTO.outdoorEngagement,
  900,
  1200
);

export const ABOUT_STATS = [
  { value: "10+", label: "Years of experience" },
  { value: "500+", label: "Families supported" },
  { value: "98%", label: "Satisfaction rate" }
] as const;

export const ABOUT_MISSION =
  "To provide structured, activity-based mentoring that builds confidence, engagement, and real change in young people's lives.";

export const ABOUT_VALUES = [
  {
    title: "Consistency",
    description:
      "Reliable sessions and predictable boundaries so young people know someone will show up for them.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.routine, 600, 400)
  },
  {
    title: "Care",
    description:
      "Warm, non-judgemental relationships that honour each young person's story and pace.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.mentoring, 600, 400)
  },
  {
    title: "Integrity",
    description:
      "Honest communication with families, schools, and agencies, aligned with safeguarding practice.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.integrityPartnership, 600, 400)
  },
  {
    title: "Evidence-based",
    description:
      "Approaches grounded in what works in youth mentoring and youth work, reviewed as we learn.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.goals, 600, 400)
  },
  {
    title: "Growth-minded",
    description:
      "We focus on strengths, small wins, and progress over perfection, building agency step by step.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.community, 600, 400)
  },
  {
    title: "Collaboration",
    description:
      "We work with parents, schools, and partners so support feels joined-up, not isolated.",
    image: camsUnsplashPhotoUrl(CAMS_UNSPLASH_PHOTO.collaboration, 600, 400)
  }
] as const;

export type AboutTeamMember = {
  readonly avatarKey: string;
  readonly name: string;
  readonly role: string;
};

/** Illustrative team roster: brand “logo + space” avatars (initials), not stock photography. */
export const ABOUT_TEAM: readonly AboutTeamMember[] = [
  {
    avatarKey: "kenneth-holder",
    name: "Kenneth Holder",
    role: "Director"
  },
  {
    avatarKey: "james-mitchell",
    name: "James Mitchell",
    role: "Senior Programme Manager"
  },
  {
    avatarKey: "emma-roberts",
    name: "Emma Roberts",
    role: "Trainer & Coach"
  },
  {
    avatarKey: "michael-chen",
    name: "Michael Chen",
    role: "Head of Partnerships"
  },
  {
    avatarKey: "lisa-thompson",
    name: "Lisa Thompson",
    role: "Safeguarding Officer"
  },
  {
    avatarKey: "david-williams",
    name: "David Williams",
    role: "Lead Mentor"
  }
] as const;

export const ABOUT_WHY_POINTS = [
  {
    title: "10+ years proven track record",
    body: "A long history of delivering mentoring and interventions alongside schools and families across the UK."
  },
  {
    title: "100% DBS checked",
    body: "Robust safer recruitment and ongoing safeguarding oversight for every team member who works with young people."
  },
  {
    title: "Activity-based approach",
    body: "Mentoring happens through boxing, fitness, community trips, and routines, so engagement feels natural."
  },
  {
    title: "Evidence-informed methods",
    body: "Programme design reflects youth mentoring evidence, clinical safeguarding expectations, and feedback from partners."
  },
  {
    title: "Personalised support",
    body: "Plans respond to each young person's goals, whether academic, social, emotional, or behavioural."
  },
  {
    title: "Real relationships matter",
    body: "Trust and consistency come before outcomes; the relationship is the intervention we protect most."
  }
] as const;
