/**
 * Blog Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface BlogStatsDTO {
  total: number;
  published: number;
  mostViewed?: {
    id: string;
    title: string;
    views: number;
  };
  mostRecent?: {
    id: string;
    title: string;
    publishedAt: string;
  };
  totalViews: number;
  averageViews: number;
  averageReadingTime: number;
}


