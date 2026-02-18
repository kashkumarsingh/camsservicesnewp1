/**
 * FAQ Item DTO
 * 
 * Data transfer object for FAQ items.
 * Simple data container for API/UI communication.
 */

export interface FAQItemDTO {
  id: string;
  title: string;
  content: string;
  slug: string;
  views: number;
  category?: string;
  createdAt: string;
  updatedAt: string;
}


