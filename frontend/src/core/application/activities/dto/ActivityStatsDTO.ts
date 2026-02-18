/**
 * Activity Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface ActivityStatsDTO {
  total: number;
  published: number;
  mostViewed?: {
    id: string;
    name: string;
    views: number;
  };
  totalViews: number;
  averageViews: number;
  averageDuration: number;
}


