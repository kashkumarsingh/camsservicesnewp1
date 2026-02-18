/**
 * Activity Suggestions Utilities
 * Provides activity insights, badges, and ranking for suggestions
 * 
 * Domain-specific utility for activities domain.
 */

export interface ActivityInsight {
  activityId: number;
  enrolledCount: number; // how many enrolled historically
  likesPercent: number;  // % of parents who rated 4-5 stars
}

// Mock insights – replace with real analytics later
export const activityInsights: Record<number, ActivityInsight> = {
  // activityId: { enrolledCount, likesPercent }
  1: { activityId: 1, enrolledCount: 842, likesPercent: 96 },
  2: { activityId: 2, enrolledCount: 730, likesPercent: 93 },
  3: { activityId: 3, enrolledCount: 680, likesPercent: 91 },
  4: { activityId: 4, enrolledCount: 512, likesPercent: 95 },
};

export function getInsightFor(activityId: number): ActivityInsight | undefined {
  return activityInsights[activityId];
}

export type SuggestionBadge = 'Most booked' | 'Kids love it' | 'Trending';

export function getBadgesFor(activityId: number): SuggestionBadge[] {
  const insight = activityInsights[activityId];
  if (!insight) return [];
  const badges: SuggestionBadge[] = [];
  if (insight.enrolledCount >= 700) badges.push('Most booked');
  if (insight.likesPercent >= 94) badges.push('Kids love it');
  if (insight.enrolledCount >= 500 && insight.likesPercent >= 90 && badges.length === 0) badges.push('Trending');
  return badges;
}

interface LocationData { postcode?: string; region?: string; city?: string }

// Small helper to score and sort activities using availability + insights
export function rankActivitiesBySuggestion<ActivityT extends { id: number; name: string }>(
  activities: ActivityT[],
  location?: LocationData
): ActivityT[] {
  const scored = activities.map((a) => {
    const insight = activityInsights[a.id];
    const popularityScore = insight ? insight.enrolledCount * (insight.likesPercent / 100) : 0;
    const availabilityBoost = location ? 100 : 0; // placeholder boost when location exists
    return { activity: a, score: popularityScore + availabilityBoost };
  });
  scored.sort((x, y) => y.score - x.score);
  return scored.map((s) => s.activity);
}

