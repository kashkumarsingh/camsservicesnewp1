/**
 * PublicPage DTO
 *
 * Data transfer object for public pages used in the admin dashboard.
 */

export interface PublicPageDTO {
  id: string;
  title: string;
  slug: string;
  type: string;
  published: boolean;
  lastUpdated: string | null;
  effectiveDate: string | null;
  version: string | null;
  views: number;
}

