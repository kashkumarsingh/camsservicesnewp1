/**
 * Public Pages Repository Interface
 *
 * Port (interface) for admin/public pages repository.
 */

import type { PublicPageDTO } from "../dto/PublicPageDTO";

export interface PublicPageFilterOptions {
  type?: string;
  published?: boolean;
}

export interface IPublicPagesRepository {
  list(options?: PublicPageFilterOptions): Promise<PublicPageDTO[]>;
}

