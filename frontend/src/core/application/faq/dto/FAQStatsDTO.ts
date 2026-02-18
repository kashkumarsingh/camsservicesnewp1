/**
 * FAQ Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface FAQStatsDTO {
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


