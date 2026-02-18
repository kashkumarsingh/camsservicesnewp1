/**
 * Service Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface ServiceStatsDTO {
  total: number;
  totalViews: number;
  averageViews: number;
  mostViewed?: {
    id: string;
    title: string;
    views: number;
  };
  byCategory: Record<string, number>;
}


