/**
 * Package Statistics DTO
 * 
 * Statistics data transfer object.
 */

export interface PackageStatsDTO {
  total: number;
  available: number;
  mostPopular?: {
    id: string;
    name: string;
    views: number;
  };
  averagePrice: number;
  averageHours: number;
}


