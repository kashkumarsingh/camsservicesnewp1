/**
 * Policy Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface PolicyStatsDTO {
  total: number;
  published: number;
  mostViewed?: {
    id: string;
    title: string;
    views: number;
  };
  totalViews: number;
  averageViews: number;
}


