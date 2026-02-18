/**
 * Service DTO
 * 
 * Data transfer object for services.
 * Simple data container for API/UI communication.
 */

export interface ServiceDTO {
  id: string;
  title: string;
  summary?: string;
  description: string;
  body?: string;
  slug: string;
  icon?: string;
  views: number;
  category?: string;
  published: boolean;
  publishAt?: string;
  createdAt: string;
  updatedAt: string;
}


